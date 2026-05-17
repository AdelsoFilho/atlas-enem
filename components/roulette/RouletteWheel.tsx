"use client"

import { motion } from "framer-motion"

export const ROULETTE_SEGMENTS = [
  { key: "math",       label: "MATEMÁTICA",  short: "MAT×4",  href: "/learn/math",       fill: "#1e3a8a", lightFill: "#2563eb", accent: "#93c5fd" },
  { key: "sciences",   label: "NATUREZA",    short: "CIÊNC",  href: "/learn/sciences",   fill: "#14532d", lightFill: "#15803d", accent: "#86efac" },
  { key: "humanities", label: "HUMANAS",     short: "HUM",    href: "/learn/humanities", fill: "#4c1d95", lightFill: "#7c3aed", accent: "#d8b4fe" },
  { key: "languages",  label: "LINGUAGENS",  short: "LING",   href: "/learn/languages",  fill: "#78350f", lightFill: "#b45309", accent: "#fcd34d" },
  { key: "writing",    label: "REDAÇÃO",     short: "RED",    href: "/essay",            fill: "#7f1d1d", lightFill: "#b91c1c", accent: "#fca5a5" },
] as const

export type RouletteSegment = typeof ROULETTE_SEGMENTS[number]

const SIZE = 280
const CX = SIZE / 2
const CY = SIZE / 2
const R = 116
const N = ROULETTE_SEGMENTS.length

// Pie slice SVG path: segment i of N equal slices
function slicePath(i: number): string {
  const a0 = (i * 2 * Math.PI) / N - Math.PI / 2
  const a1 = ((i + 1) * 2 * Math.PI) / N - Math.PI / 2
  const x1 = (CX + R * Math.cos(a0)).toFixed(2)
  const y1 = (CY + R * Math.sin(a0)).toFixed(2)
  const x2 = (CX + R * Math.cos(a1)).toFixed(2)
  const y2 = (CY + R * Math.sin(a1)).toFixed(2)
  return `M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2} Z`
}

// Spoke line SVG
function spokeLine(i: number): { x2: number; y2: number } {
  const angle = (i * 2 * Math.PI) / N - Math.PI / 2
  return { x2: Number((CX + R * Math.cos(angle)).toFixed(2)), y2: Number((CY + R * Math.sin(angle)).toFixed(2)) }
}

// Label position and rotation for text in segment i
function labelTransform(i: number): { x: number; y: number; rotate: number } {
  const mid = ((i + 0.5) * 2 * Math.PI) / N - Math.PI / 2
  const lr = R * 0.60
  const midDeg = ((i + 0.5) * 360) / N
  // Flip text for bottom half so it reads correctly
  const rotate = midDeg > 90 && midDeg < 270 ? midDeg + 180 : midDeg
  return {
    x: Number((CX + lr * Math.cos(mid)).toFixed(2)),
    y: Number((CY + lr * Math.sin(mid)).toFixed(2)),
    rotate,
  }
}

// Outer decorative dots around rim
function rimDots() {
  const dots: { x: number; y: number }[] = []
  const DOT_R = R + 8
  for (let i = 0; i < 30; i++) {
    const angle = (i * 2 * Math.PI) / 30 - Math.PI / 2
    dots.push({ x: Number((CX + DOT_R * Math.cos(angle)).toFixed(2)), y: Number((CY + DOT_R * Math.sin(angle)).toFixed(2)) })
  }
  return dots
}

const DOTS = rimDots()

interface RouletteWheelProps {
  rotation: number
  isSpinning: boolean
  winnerIndex: number | null
  onAnimationComplete: () => void
}

export function RouletteWheel({ rotation, isSpinning, winnerIndex, onAnimationComplete }: RouletteWheelProps) {
  return (
    <div
      className="relative mx-auto select-none"
      style={{ width: SIZE + 56, height: SIZE + 56 }}
    >
      {/* Ambient glow ring */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: 20,
          borderRadius: "50%",
          transition: "box-shadow 0.8s ease",
          boxShadow: isSpinning
            ? "0 0 60px #3b82f6, 0 0 120px #3b82f640, inset 0 0 30px #3b82f620"
            : winnerIndex !== null
            ? "0 0 50px #f97316, 0 0 100px #f9731640"
            : "0 0 20px #3b82f620",
        }}
      />

      {/* Fixed pointer arrow (top center, does NOT rotate) */}
      <div
        className="absolute z-20"
        style={{ top: 5, left: "50%", transform: "translateX(-50%)" }}
      >
        <svg width="26" height="30" viewBox="0 0 26 30" suppressHydrationWarning>
          <polygon points="13,30 0,5 26,5" fill="white" />
          <polygon points="13,24 4,7 22,7" fill="#0f172a" />
          <line x1="13" y1="0" x2="13" y2="8" stroke="white" strokeWidth="2" />
        </svg>
      </div>

      {/* Rotating wheel */}
      <motion.div
        className="absolute"
        style={{ inset: 28, willChange: "transform" }}
        animate={{ rotate: rotation }}
        transition={{ duration: 4.5, ease: [0.04, 0.92, 0.08, 1.0] }}
        onAnimationComplete={onAnimationComplete}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          suppressHydrationWarning
        >
          {/* Background */}
          <circle cx={CX} cy={CY} r={R + 14} fill="#050a14" />

          {/* Outer decorative ring */}
          <circle cx={CX} cy={CY} r={R + 12} fill="none" stroke="#0f172a" strokeWidth="8" />
          <circle cx={CX} cy={CY} r={R + 10} fill="none" stroke="#1e3a8a" strokeWidth="1.5" strokeOpacity="0.8" />

          {/* Rim dots */}
          {DOTS.map((d, idx) => (
            <circle key={idx} cx={d.x} cy={d.y} r="2.5" fill={idx % 2 === 0 ? "#fbbf24" : "#ffffff"} opacity="0.7" />
          ))}

          {/* Segments */}
          {ROULETTE_SEGMENTS.map((seg, i) => {
            const tt = labelTransform(i)
            const isWinner = winnerIndex === i
            return (
              <g key={seg.key}>
                <path
                  d={slicePath(i)}
                  fill={isWinner ? seg.lightFill : seg.fill}
                  stroke="#000"
                  strokeWidth="1.5"
                />
                <text
                  x={tt.x}
                  y={tt.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={isWinner ? "#ffffff" : seg.accent}
                  fontSize="8.5"
                  fontWeight="bold"
                  fontFamily="ui-monospace, monospace"
                  letterSpacing="1"
                  transform={`rotate(${tt.rotate}, ${tt.x}, ${tt.y})`}
                >
                  {seg.short}
                </text>
              </g>
            )
          })}

          {/* Spoke dividers */}
          {Array.from({ length: N }).map((_, i) => {
            const s = spokeLine(i)
            return (
              <line
                key={i}
                x1={CX} y1={CY}
                x2={s.x2} y2={s.y2}
                stroke="#000"
                strokeWidth="2"
              />
            )
          })}

          {/* Center hub */}
          <circle cx={CX} cy={CY} r={26} fill="#000" stroke="#1e40af" strokeWidth="2.5" />
          <circle cx={CX} cy={CY} r={18} fill="#1e3a8a" />
          <circle cx={CX} cy={CY} r={10} fill="#3b82f6" />
          <circle cx={CX} cy={CY} r={4} fill="#000" />
        </svg>
      </motion.div>
    </div>
  )
}
