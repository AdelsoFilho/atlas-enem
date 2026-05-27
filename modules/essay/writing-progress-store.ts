"use client"

import { create } from "zustand"
import { supabase } from "@/lib/supabaseClient"
import {
  getUserWritingState,
  unlockNextWritingLevel,
  type UserWritingLevelRow,
} from "@/lib/supabaseClient"
import type {
  SkillLesson,
  UserLessonProgress,
  WritingLevel,
  WritingStepFeedback,
  LessonStatus,
} from "@/modules/essay/writing-types"

// ── State ─────────────────────────────────────────────────────────────────────

interface WritingProgressState {
  // Skill tree loaded once (public)
  lessons:          SkillLesson[]
  isTreeLoaded:     boolean

  // Per-lesson scores: lessonId → progress
  progressMap:      Record<string, UserLessonProgress>
  isProgressLoaded: boolean

  // Coarse-grained level unlock state (from DB)
  levelRows:            UserWritingLevelRow[]
  currentWritingLevel:  number           // mirrors profiles.current_writing_level
  isLevelStateLoaded:   boolean

  // Derived selectors
  getLevels:       () => WritingLevel[]
  isLevelUnlocked: (levelNumber: number) => boolean
  getLevelStatus:  (levelNumber: number) => LessonStatus

  // Actions
  loadTree:          () => Promise<void>
  loadProgress:      (userId: string) => Promise<void>
  loadLevelState:    (userId: string) => Promise<void>
  saveProgress:      (params: SaveProgressParams) => Promise<void>
}

interface SaveProgressParams {
  userId:       string
  lessonId:     string
  score:        number
  status:       "in_progress" | "completed"
  answerJson?:  unknown
  feedbackJson?: WritingStepFeedback
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useWritingProgressStore = create<WritingProgressState>((set, get) => ({
  lessons:             [],
  isTreeLoaded:        false,
  progressMap:         {},
  isProgressLoaded:    false,
  levelRows:           [],
  currentWritingLevel: 0,
  isLevelStateLoaded:  false,

  // ── Derived: build WritingLevel[] from lessons + progressMap ──────────────
  getLevels: () => {
    const { lessons, progressMap } = get()
    const levelMap: Record<number, SkillLesson[]> = {}

    for (const lesson of lessons) {
      if (!levelMap[lesson.levelNumber]) levelMap[lesson.levelNumber] = []
      levelMap[lesson.levelNumber].push(lesson)
    }

    return Object.entries(levelMap)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([levelStr, lvLessons]) => {
        const levelNumber    = Number(levelStr)
        const sorted         = [...lvLessons].sort((a, b) => a.lessonOrder - b.lessonOrder)
        const completedCount = sorted.filter(
          l => (progressMap[l.id]?.score ?? 0) >= l.minScoreToPass
        ).length

        let status: LessonStatus
        if (!get().isLevelUnlocked(levelNumber)) {
          status = "locked"
        } else if (completedCount === sorted.length) {
          status = "completed"
        } else if (completedCount > 0) {
          status = "in_progress"
        } else {
          status = "not_started"
        }

        return {
          levelNumber,
          levelName:      sorted[0]?.levelName ?? `Nível ${levelNumber}`,
          lessons:        sorted,
          status,
          completedCount,
          totalCount:     sorted.length,
        }
      })
  },

  // Level 0 always unlocked; level N requires ALL lessons of N-1 passed
  isLevelUnlocked: (levelNumber) => {
    if (levelNumber === 0) return true
    const { lessons, progressMap } = get()
    const prevLessons = lessons.filter(l => l.levelNumber === levelNumber - 1)
    if (prevLessons.length === 0) return false
    return prevLessons.every(l => (progressMap[l.id]?.score ?? 0) >= l.minScoreToPass)
  },

  getLevelStatus: (levelNumber) => {
    if (!get().isLevelUnlocked(levelNumber)) return "locked"
    const { lessons, progressMap } = get()
    const lvLessons      = lessons.filter(l => l.levelNumber === levelNumber)
    const completedCount = lvLessons.filter(
      l => (progressMap[l.id]?.score ?? 0) >= l.minScoreToPass
    ).length
    if (completedCount === lvLessons.length && lvLessons.length > 0) return "completed"
    if (completedCount > 0) return "in_progress"
    return "not_started"
  },

  // ── Load skill tree (public) ──────────────────────────────────────────────
  loadTree: async () => {
    if (get().isTreeLoaded) return

    const { data, error } = await supabase
      .from("writing_skill_tree")
      .select("*")
      .order("level_number", { ascending: true })
      .order("lesson_order",  { ascending: true })

    if (error) {
      console.warn("[writing tree]", error.message)
      return
    }

    const lessons: SkillLesson[] = (data ?? []).map(row => ({
      id:             row.lesson_id,
      levelNumber:    row.level_number,
      levelName:      row.level_name,
      lessonOrder:    row.lesson_order,
      lessonType:     row.lesson_type,
      title:          row.title,
      instructions:   row.instructions,
      exerciseData:   row.exercise_data,
      requiresLesson: row.requires_lesson,
      minScoreToPass: row.min_score_to_pass,
    }))

    set({ lessons, isTreeLoaded: true })
  },

  // ── Load per-lesson progress ──────────────────────────────────────────────
  loadProgress: async (userId) => {
    const { data, error } = await supabase
      .from("user_writing_progress")
      .select("*")
      .eq("user_id", userId)

    if (error) {
      console.warn("[writing progress]", error.message)
      set({ isProgressLoaded: true })
      return
    }

    const progressMap: Record<string, UserLessonProgress> = {}
    for (const row of (data ?? [])) {
      progressMap[row.lesson_id] = {
        lessonId:        row.lesson_id,
        status:          row.status,
        score:           row.score,
        attempts:        row.attempts,
        lastAnswerJson:  row.last_answer_json,
        feedbackJson:    row.feedback_json,
        completedAt:     row.completed_at,
      }
    }

    set({ progressMap, isProgressLoaded: true })
  },

  // ── Load coarse-grained level state (DB) ──────────────────────────────────
  loadLevelState: async (userId) => {
    const rows = await getUserWritingState(userId)

    if (!rows.length) {
      set({ isLevelStateLoaded: true })
      return
    }

    set({
      levelRows:           rows,
      currentWritingLevel: rows[0]?.currentLevel ?? 0,
      isLevelStateLoaded:  true,
    })
  },

  // ── Save progress + auto-unlock ───────────────────────────────────────────
  saveProgress: async ({ userId, lessonId, score, status, answerJson, feedbackJson }) => {
    // 1. Persist to DB
    const { error } = await supabase.rpc("upsert_writing_progress", {
      p_user_id:     userId,
      p_lesson_id:   lessonId,
      p_score:       score,
      p_status:      status,
      p_last_answer: answerJson  ?? null,
      p_feedback:    feedbackJson ?? null,
    })

    if (error) {
      console.warn("[writing save]", error.message)
      return
    }

    // 2. Optimistic update of progressMap
    const prevMap = get().progressMap
    const updated: Record<string, UserLessonProgress> = {
      ...prevMap,
      [lessonId]: {
        lessonId,
        status,
        score:           Math.max(prevMap[lessonId]?.score ?? 0, score),
        attempts:        (prevMap[lessonId]?.attempts ?? 0) + 1,
        lastAnswerJson:  answerJson  ?? prevMap[lessonId]?.lastAnswerJson ?? null,
        feedbackJson:    feedbackJson ?? prevMap[lessonId]?.feedbackJson  ?? null,
        completedAt:
          status === "completed"
            ? (prevMap[lessonId]?.completedAt ?? new Date().toISOString())
            : (prevMap[lessonId]?.completedAt ?? null),
      },
    }
    set({ progressMap: updated })

    // 3. Check if ALL lessons of current level are now passed
    if (status !== "completed" && score < 70) return   // quick exit — clearly not done

    const { lessons, currentWritingLevel } = get()
    const currentLevelLessons = lessons.filter(l => l.levelNumber === currentWritingLevel)
    const allPassed = currentLevelLessons.every(
      l => (updated[l.id]?.score ?? 0) >= l.minScoreToPass
    )

    if (!allPassed || currentLevelLessons.length === 0) return

    // 4. All lessons passed → try unlock
    const didUnlock = await unlockNextWritingLevel(userId)
    if (!didUnlock) return

    const newLevel = currentWritingLevel + 1

    // 5. Optimistic update of coarse-grained state
    set(state => ({
      currentWritingLevel: newLevel,
      levelRows: state.levelRows.map(row => {
        if (row.levelNumber === currentWritingLevel) return { ...row, status: "completed" }
        if (row.levelNumber === newLevel)            return { ...row, status: "in_progress" }
        return row
      }),
    }))
  },
}))
