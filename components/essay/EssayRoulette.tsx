"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Flame, RotateCcw, PenLine, ChevronRight } from "lucide-react"

// ── Essay topic data ──────────────────────────────────────────────────────────

const SECTORS = [
  { cat: "EDUCAÇÃO",   fill: "#713f12", lightFill: "#a16207", accent: "#fde68a", short: "EDU" },
  { cat: "TECNOLOGIA", fill: "#7c2d12", lightFill: "#c2410c", accent: "#fb923c", short: "TEC" },
  { cat: "SOCIEDADE",  fill: "#78350f", lightFill: "#b45309", accent: "#fbbf24", short: "SOC" },
  { cat: "AMBIENTE",   fill: "#14532d", lightFill: "#15803d", accent: "#86efac", short: "AMB" },
  { cat: "CULTURA",    fill: "#581c87", lightFill: "#7e22ce", accent: "#d8b4fe", short: "CUL" },
  { cat: "SAÚDE",      fill: "#7f1d1d", lightFill: "#b91c1c", accent: "#fca5a5", short: "SAÚ" },
] as const

type SectorCat = typeof SECTORS[number]["cat"]

const TOPICS_BY_SECTOR: Record<SectorCat, string[]> = {
  EDUCAÇÃO:   ["Desafios da Educação Básica no Brasil", "Inclusão Digital de Idosos"],
  TECNOLOGIA: ["Impactos da Inteligência Artificial no Trabalho", "Ética nas Redes Sociais"],
  SOCIEDADE:  ["Envelhecimento da População e Previdência", "Violência Urbana e Segurança Pública", "Combate à Fome e Segurança Alimentar"],
  AMBIENTE:   ["Sustentabilidade e Gestão de Resíduos"],
  CULTURA:    ["Democratização do Acesso à Cultura"],
  SAÚDE:      ["Saúde Mental na Sociedade Contemporânea"],
}

// ── SVG wheel helpers ─────────────────────────────────────────────────────────

const SIZE = 220
const CX = SIZE / 2
const CY = SIZE / 2
const R  = 96
const N  = SECTORS.length
const SEG_DEG = 360 / N

function slicePath(i: number): string {
  const a0 = (i * 2 * Math.PI) / N - Math.PI / 2
  const a1 = ((i + 1) * 2 * Math.PI) / N - Math.PI / 2
  const x1 = (CX + R * Math.cos(a0)).toFixed(2)
  const y1 = (CY + R * Math.sin(a0)).toFixed(2)
  const x2 = (CX + R * Math.cos(a1)).toFixed(2)
  const y2 = (CY + R * Math.sin(a1)).toFixed(2)
  return `M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2} Z`
}

function labelPos(i: number) {
  const mid = ((i + 0.5) * 2 * Math.PI) / N - Math.PI / 2
  const lr  = R * 0.58
  const midDeg = ((i + 0.5) * 360) / N
  const rotate = midDeg > 90 && midDeg < 270 ? midDeg + 180 : midDeg
  return {
    x: Number((CX + lr * Math.cos(mid)).toFixed(2)),
    y: Number((CY + lr * Math.sin(mid)).toFixed(2)),
    rotate,
  }
}

// ── Sound helpers ─────────────────────────────────────────────────────────────

function playTick() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    const osc = ctx.createOscillator(); const g = ctx.createGain()
    osc.connect(g); g.connect(ctx.destination)
    osc.type = "square"; osc.frequency.value = 1200
    g.gain.setValueAtTime(0.05, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04)
    osc.start(); osc.stop(ctx.currentTime + 0.04)
  } catch {}
}

function playWin() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    ;[523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator(); const g = ctx.createGain()
      osc.connect(g); g.connect(ctx.destination)
      osc.frequency.value = freq
      g.gain.setValueAtTime(0, ctx.currentTime + i * 0.11)
      g.gain.linearRampToValueAtTime(0.1, ctx.currentTime + i * 0.11 + 0.03)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.11 + 0.25)
      osc.start(ctx.currentTime + i * 0.11); osc.stop(ctx.currentTime + i * 0.11 + 0.25)
    })
  } catch {}
}

// ── Component ─────────────────────────────────────────────────────────────────

export function EssayRoulette() {
  const router = useRouter()

  const [rotation, setRotation]       = useState(0)
  const [isSpinning, setIsSpinning]   = useState(false)
  const [winSector, setWinSector]     = useState<number | null>(null)
  const [winTopic, setWinTopic]       = useState<string | null>(null)
  const pendingRef                     = useRef<number>(0)

  // ── Tick sounds while spinning ────────────────────────────────────────────
  useEffect(() => {
    if (!isSpinning) return
    const state = { ms: 70 }
    let tid: ReturnType<typeof setTimeout>
    function tick() {
      playTick()
      state.ms = Math.min(state.ms * 1.06, 500)
      tid = setTimeout(tick, state.ms)
    }
    tid = setTimeout(tick, state.ms)
    return () => clearTimeout(tid)
  }, [isSpinning])

  // ── Spin ──────────────────────────────────────────────────────────────────
  function handleSpin() {
    if (isSpinning) return
    const target = Math.floor(Math.random() * N)
    pendingRef.current = target
    const currentMod = rotation % 360
    const targetAngle = target * SEG_DEG + SEG_DEG / 2
    const extraSpins  = (5 + Math.floor(Math.random() * 5)) * 360
    const delta       = ((targetAngle - currentMod) + 360) % 360
    setWinSector(null)
    setWinTopic(null)
    setIsSpinning(true)
    setRotation(prev => prev + extraSpins + delta)
  }

  function handleAnimationComplete() {
    if (!isSpinning) return
    const idx = pendingRef.current
    const cat = SECTORS[idx].cat
    const topics = TOPICS_BY_SECTOR[cat]
    const topic  = topics[Math.floor(Math.random() * topics.length)]
    setIsSpinning(false)
    setWinSector(idx)
    setWinTopic(topic)
    playWin()
  }

  const winner = winSector !== null ? SECTORS[winSector] : null

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="rounded-2xl bg-[#0d0e11] p-5"
      style={{ border: "1px solid #f97316", boxShadow: "0 0 30px #f9731618, 0 0 60px #f9731608" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <Flame className="h-5 w-5 text-orange-500" suppressHydrationWarning />
        <h2 className="font-mono text-sm font-black uppercase tracking-widest text-orange-400">
          Desafio Diário: Redação
        </h2>
      </div>
      <p className="font-mono text-xs text-neutral-500 mb-5 ml-7">
        Gire a sorte — tema do dia
      </p>

      {/* Wheel + result row */}
      <div className="flex flex-col sm:flex-row items-center gap-6">

        {/* ── Wheel ── */}
        <div
          className="relative shrink-0"
          style={{ width: SIZE + 36, height: SIZE + 36 }}
        >
          {/* Glow ring */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              inset: 14,
              borderRadius: "50%",
              transition: "box-shadow 0.8s",
              boxShadow: isSpinning
                ? "0 0 50px #f97316, 0 0 100px #f9731630"
                : winner
                ? `0 0 35px ${winner.accent}, 0 0 70px ${winner.accent}30`
                : "0 0 20px #f9731620",
            }}
          />

          {/* Fixed pointer */}
          <div className="absolute z-20" style={{ top: 4, left: "50%", transform: "translateX(-50%)" }}>
            <svg width="22" height="26" viewBox="0 0 22 26" suppressHydrationWarning>
              <polygon points="11,26 0,5 22,5" fill="white" />
              <polygon points="11,20 4,7 18,7" fill="#0d0e11" />
            </svg>
          </div>

          {/* Rotating wheel */}
          <motion.div
            className="absolute"
            style={{ inset: 22, willChange: "transform" }}
            animate={{ rotate: rotation }}
            transition={{ duration: 4.2, ease: [0.04, 0.92, 0.08, 1.0] }}
            onAnimationComplete={handleAnimationComplete}
          >
            <svg width="100%" height="100%" viewBox={`0 0 ${SIZE} ${SIZE}`} suppressHydrationWarning>
              {/* Background */}
              <circle cx={CX} cy={CY} r={R + 10} fill="#070809" />
              {/* Outer ring */}
              <circle cx={CX} cy={CY} r={R + 8} fill="none" stroke="#0d0e11" strokeWidth="8" />
              <circle cx={CX} cy={CY} r={R + 6} fill="none" stroke="#f97316" strokeWidth="1.5" strokeOpacity="0.7" />

              {/* Segments */}
              {SECTORS.map((seg, i) => {
                const lp = labelPos(i)
                const isWin = winSector === i
                return (
                  <g key={seg.cat}>
                    <path d={slicePath(i)} fill={isWin ? seg.lightFill : seg.fill} stroke="#000" strokeWidth="1.5" />
                    <text
                      x={lp.x} y={lp.y}
                      textAnchor="middle" dominantBaseline="middle"
                      fill={isWin ? "#fff" : seg.accent}
                      fontSize="7.5" fontWeight="bold"
                      fontFamily="ui-monospace, monospace"
                      letterSpacing="1"
                      transform={`rotate(${lp.rotate}, ${lp.x}, ${lp.y})`}
                    >
                      {seg.short}
                    </text>
                  </g>
                )
              })}

              {/* Dividers */}
              {Array.from({ length: N }).map((_, i) => {
                const angle = (i * 2 * Math.PI) / N - Math.PI / 2
                return (
                  <line key={i}
                    x1={CX} y1={CY}
                    x2={(CX + R * Math.cos(angle)).toFixed(2)}
                    y2={(CY + R * Math.sin(angle)).toFixed(2)}
                    stroke="#000" strokeWidth="1.5"
                  />
                )
              })}

              {/* Hub */}
              <circle cx={CX} cy={CY} r={20} fill="#000" stroke="#f97316" strokeWidth="2" />
              <circle cx={CX} cy={CY} r={12} fill="#f97316" />
              <circle cx={CX} cy={CY} r={5} fill="#000" />
            </svg>
          </motion.div>
        </div>

        {/* ── Result / Idle ── */}
        <div className="flex-1 flex flex-col gap-3 w-full">
          <AnimatePresence mode="wait">
            {isSpinning && (
              <motion.p
                key="spinning"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="font-mono text-xs text-orange-400 tracking-widest animate-pulse text-center sm:text-left"
              >
                SORTEANDO…
              </motion.p>
            )}

            {winner && winTopic && !isSpinning && (
              <motion.div
                key="result"
                initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className="rounded-xl p-4 border"
                style={{
                  borderColor: `${winner.accent}50`,
                  background: `linear-gradient(135deg, ${winner.fill}90, #0d0e11)`,
                  boxShadow: `0 0 25px ${winner.accent}25`,
                }}
              >
                <p className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: winner.accent }}>
                  {winner.cat} · Tema sorteado
                </p>
                <p className="text-white font-bold text-base leading-snug mb-4">
                  "{winTopic}"
                </p>
                <button
                  onClick={() => router.push("/essay")}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #ea580c, #f97316)", boxShadow: "0 0 16px #f9731640", minHeight: 44 }}
                >
                  <PenLine className="h-4 w-4" suppressHydrationWarning />
                  Começar a Escrever
                  <ChevronRight className="h-4 w-4" suppressHydrationWarning />
                </button>
              </motion.div>
            )}

            {!winner && !isSpinning && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-1.5"
              >
                <p className="text-neutral-400 text-sm font-semibold">Temas disponíveis:</p>
                <ul className="space-y-1">
                  {Object.entries(TOPICS_BY_SECTOR).flatMap(([cat, topics]) =>
                    topics.map(topic => (
                      <li key={topic} className="flex items-start gap-2 text-xs text-neutral-500 leading-relaxed">
                        <span className="text-orange-600 shrink-0 mt-0.5">•</span>
                        {topic}
                      </li>
                    ))
                  )}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* SORTEAR button + spin again */}
      <div className="mt-5 flex flex-col sm:flex-row items-center gap-3">
        <motion.button
          onClick={handleSpin}
          disabled={isSpinning}
          whileTap={{ scale: 0.97 }}
          className="relative w-full sm:w-auto flex-1 sm:flex-none rounded-xl px-8 py-3.5 font-black text-base text-white uppercase tracking-widest overflow-hidden transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            minHeight: 52,
            background: isSpinning
              ? "linear-gradient(135deg, #1a1a1a, #111)"
              : "linear-gradient(135deg, #c2410c, #f97316, #fb923c)",
            boxShadow: isSpinning ? "none" : "0 0 24px #f9731650, 0 6px 18px rgba(0,0,0,0.5)",
          }}
        >
          {!isSpinning && (
            <motion.span
              className="absolute inset-0 rounded-xl"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ boxShadow: "inset 0 0 18px #ffffff25" }}
            />
          )}
          <span className="relative z-10 flex items-center justify-center gap-2">
            <Flame className="h-5 w-5" suppressHydrationWarning />
            {isSpinning ? "Girando…" : "Sortear Tema"}
          </span>
        </motion.button>

        {winner && !isSpinning && (
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={() => { setWinSector(null); setWinTopic(null); handleSpin() }}
            className="flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-400 transition-colors py-2 px-3"
          >
            <RotateCcw className="h-3 w-3" suppressHydrationWarning />
            Girar de novo
          </motion.button>
        )}
      </div>
    </div>
  )
}
