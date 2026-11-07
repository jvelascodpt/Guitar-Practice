import { useEffect, useRef, useState, type CSSProperties } from 'react'

/** Lets Settings replay the intro on demand. */
export const introEvents = new EventTarget()

/** Time for the neck to cross the screen. */
const SWEEP_MS = 2200
const NOTE_MS = 320

// ---- fretboard geometry (SVG units; viewBox 1000 × 260) ----
// The nut is on the right so the headstock leads, and the frets climb to the
// left. As the neck slides right, the visible window moves up the neck, so the
// lit notes run up in pitch, like a shred run.
const W = 1000
const NUT_X = 960
const SCALE = 1500
const FRETS = 17
const fretX = (n: number) => NUT_X - SCALE * (1 - 2 ** (-n / 12))
const H = 260
const STRING_Y = [52, 83, 114, 146, 177, 208] // high E → low E
const STRING_W = [1.5, 1.9, 2.4, 3, 3.6, 4.2]
const INLAYS = [3, 5, 7, 9, 15, 17]

/** Sweep direction: bottom-left → top-right, this many degrees above horizontal. */
const ANGLE = 35

/**
 * Sweep geometry in px for this screen. Everything happens inside a square
 * stage rotated by ANGLE and centred on the screen, so a plain left-to-right
 * slide inside it is a diagonal on screen. `extent` is half the screen's
 * length along the sweep direction, so the neck starts just touching the
 * bottom-left corner and finishes just past the top-right.
 */
function geometry() {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const rad = (ANGLE * Math.PI) / 180
  const stage = Math.ceil(Math.hypot(vw, vh)) + 8
  const extent = (vw * Math.cos(rad) + vh * Math.sin(rad)) / 2
  const neck = Math.round(1.6 * Math.min(vw, 520))
  const from = stage / 2 - extent - neck
  const to = stage / 2 + extent
  return { stage, neck, extent, from, to, travel: to - from }
}
type Geometry = ReturnType<typeof geometry>

interface Note {
  x: number
  y: number
  delay: number
}

function buildRun(g: Geometry): Note[] {
  /** When (0–1 through the sweep) a point on the neck crosses mid-screen. */
  const centredAt = (x: number) => (g.extent + g.neck * (1 - x / W)) / g.travel
  // Minor-pentatonic-style boxes climbing the neck, low E → high E in each,
  // then fired one note at a time, rapid-fire, as the neck goes by.
  const boxes = [
    [1, 3],
    [3, 5],
    [5, 8],
    [8, 10],
    [10, 12],
    [12, 15],
    [15, 17],
  ]
  const run: { x: number; y: number }[] = []
  for (const [a, b] of boxes)
    for (let s = 5; s >= 0; s--) for (const f of s % 2 ? [a, b] : [b, a]) run.push({ x: (fretX(f - 1) + fretX(f)) / 2, y: STRING_Y[s] })
  const first = centredAt(run[0].x) - 0.08
  const last = centredAt(run[run.length - 1].x) + 0.04
  return run.map((n, k) => ({ ...n, delay: (first + ((last - first) * k) / (run.length - 1)) * SWEEP_MS }))
}

/**
 * Launch animation: a guitar neck crawls diagonally across the screen with notes firing
 * along it, wiping away the dark cover to reveal the homepage underneath.
 * Pure CSS/SVG, so it starts instantly, works offline and can't be blocked.
 * Tap anywhere to skip.
 */
export function FretboardIntro({ onDone }: { onDone: () => void }) {
  const [g] = useState(geometry)
  const [notes] = useState(() => buildRun(g))
  const [leaving, setLeaving] = useState(false)
  const doneRef = useRef(false)

  const finish = () => {
    if (doneRef.current) return
    doneRef.current = true
    setLeaving(true)
    window.setTimeout(onDone, 160)
  }

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (!doneRef.current) {
        doneRef.current = true
        onDone()
      }
    }, SWEEP_MS + 80)
    return () => clearTimeout(t)
  }, [onDone])

  const timing = (name: string, from: number, to: number): CSSProperties => ({
    animation: `${name} ${SWEEP_MS}ms linear both`,
    ['--gy-from' as string]: `${from}px`,
    ['--gy-to' as string]: `${to}px`,
  })

  return (
    <button
      type="button"
      aria-label="Skip intro"
      onClick={finish}
      className={`fixed inset-0 z-[60] overflow-hidden cursor-default transition-opacity duration-150 ${leaving ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* Rotated stage: left-to-right inside it is a diagonal on screen. */}
      <div className="absolute left-1/2 top-1/2" style={{ width: g.stage, height: g.stage, transform: `translate(-50%, -50%) rotate(-${ANGLE}deg)` }}>
        {/* Dark cover; its edge follows the neck's leading edge. */}
        <div className="absolute inset-0 bg-bg" style={timing('gy-reveal', g.from + g.neck, g.to + g.neck)} />

        {/* The sweeping neck, plus a glowing edge where it meets the cover. */}
        <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none" style={{ width: g.neck, ...timing('gy-sweep', g.from, g.to) }}>
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-accent/35 to-transparent" />
          <div className="absolute inset-y-0 right-0 w-[2px] bg-accent shadow-[0_0_18px_4px_var(--accent)]" />
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)] [mask-image:linear-gradient(to_right,transparent,black_18%)]"
            aria-hidden
          >
            <defs>
              <linearGradient id="gy-wood" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#24150c" />
                <stop offset="0.5" stopColor="#3b2414" />
                <stop offset="1" stopColor="#22140b" />
              </linearGradient>
              <linearGradient id="gy-fret" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#8d929b" />
                <stop offset="0.5" stopColor="#eef0f4" />
                <stop offset="1" stopColor="#8d929b" />
              </linearGradient>
              <filter id="gy-glow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="5" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* headstock */}
            <path d={`M${NUT_X} 28 L${W} 8 L${W} 252 L${NUT_X} 232 Z`} fill="#1a1a1f" />
            {/* board + binding */}
            <rect x="0" y="30" width={NUT_X} height="200" fill="url(#gy-wood)" />
            <rect x="0" y="27" width={NUT_X} height="4" fill="#e9dcc0" />
            <rect x="0" y="229" width={NUT_X} height="4" fill="#e9dcc0" />
            {/* inlays */}
            {INLAYS.map((n) => {
              const x = (fretX(n - 1) + fretX(n)) / 2
              return <circle key={n} cx={x} cy="130" r="9" fill="#e8e2d0" opacity="0.75" />
            })}
            {[98, 162].map((y) => (
              <circle key={y} cx={(fretX(11) + fretX(12)) / 2} cy={y} r="9" fill="#e8e2d0" opacity="0.75" />
            ))}
            {/* frets + nut */}
            {Array.from({ length: FRETS }, (_, i) => (
              <rect key={i} x={fretX(i + 1) - 2.5} y="30" width="5" height="200" fill="url(#gy-fret)" />
            ))}
            <rect x={NUT_X - 3} y="27" width="10" height="206" fill="#efe6d0" />
            {/* strings */}
            {STRING_Y.map((y, i) => (
              <rect key={y} x="0" y={y - STRING_W[i] / 2} width={W} height={STRING_W[i]} fill={i < 2 ? '#e3e6ec' : '#c9b48a'} />
            ))}
            {/* the shred run */}
            <g filter="url(#gy-glow)">
              {notes.map((n, i) => (
                <circle
                  key={i}
                  cx={n.x}
                  cy={n.y}
                  r="12"
                  fill="var(--accent)"
                  style={{ animation: `gy-note ${NOTE_MS}ms ease-out ${Math.round(n.delay)}ms both`, transformBox: 'fill-box', transformOrigin: 'center' }}
                />
              ))}
            </g>
          </svg>
        </div>
      </div>
    </button>
  )
}
