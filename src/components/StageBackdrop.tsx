import { FRET } from '../lib/fret'

/**
 * Stage theme background: five coloured spotlight beams sweeping slowly over
 * a dark stage, with a haze glow rising from the floor. Pure CSS; the sweep
 * stops when the OS asks for reduced motion.
 */
const BEAMS = [
  { x: 8, tilt: 14, dur: 13 },
  { x: 29, tilt: 6, dur: 17 },
  { x: 50, tilt: 0, dur: 15 },
  { x: 71, tilt: -6, dur: 19 },
  { x: 92, tilt: -14, dur: 14 },
]

export function StageBackdrop() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
      {/* floor haze */}
      <div className="absolute inset-x-[-20%] bottom-[-25%] h-[70%] bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,.38),transparent_65%)]" />
      {/* beams */}
      {BEAMS.map((b, i) => (
        <div
          key={i}
          className="gy-beam absolute top-[-6%] h-[115%] w-[46vw] max-w-[260px] origin-top"
          style={{
            left: `${b.x}%`,
            background: `linear-gradient(180deg, ${FRET[i]}cc, ${FRET[i]}33 55%, transparent 92%)`,
            clipPath: 'polygon(46% 0, 54% 0, 100% 100%, 0 100%)',
            filter: 'blur(10px)',
            opacity: 0.42,
            mixBlendMode: 'screen',
            ['--tilt' as string]: `${b.tilt}deg`,
            animation: `gy-beam ${b.dur}s ease-in-out ${-i * 2.3}s infinite alternate`,
          }}
        />
      ))}
      {/* light fixtures along the top */}
      {BEAMS.map((b, i) => (
        <div
          key={`l${i}`}
          className="absolute top-[-10px] h-6 w-6 -translate-x-1/2 rounded-full"
          style={{ left: `${b.x}%`, background: FRET[i], boxShadow: `0 0 24px 8px ${FRET[i]}aa`, opacity: 0.9 }}
        />
      ))}
      {/* darken the middle a touch so text stays crisp */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(12,8,22,.55),transparent_75%)]" />
    </div>
  )
}
