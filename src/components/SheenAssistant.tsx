import { useEffect, useRef, useState, type ReactNode } from 'react'
import { SheenFigure, sheenLook, type SheenMode } from './Sheen'
import { usePlayer } from '../audio/guitar'
import type { Song } from '../data/types'
import { FRET } from '../lib/fret'
import { cx } from './ui'

const SHEEN_W = 96
const AMP_W = 30
const WALK_SPEED = 46 // px per second

const reducedMotion = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

function Amp({ side }: { side: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 30 46" className={cx('absolute bottom-1 w-[30px] h-[46px]', side === 'left' ? 'left-0' : 'right-0')} aria-hidden>
      <rect x="1" y="1" width="28" height="18" rx="2" fill="#1d1a24" stroke="#3a3446" />
      <rect x="4" y="4" width="22" height="5" rx="1" fill="#2b2633" />
      {[7, 12, 17, 22].map((x) => (
        <circle key={x} cx={x} cy="14" r="1.6" fill="#d4d4d8" />
      ))}
      <rect x="1" y="20" width="28" height="25" rx="2" fill="#1d1a24" stroke="#3a3446" />
      <rect x="4" y="23" width="22" height="19" rx="1.5" fill={`url(#amp-grille-${side})`} />
      <circle cx="25" cy="6.5" r="1.3" fill="#f97316" />
      <defs>
        <pattern id={`amp-grille-${side}`} width="3" height="3" patternUnits="userSpaceOnUse">
          <rect width="3" height="3" fill="#2b2633" />
          <path d="M0 3 L3 0" stroke="#4a4357" strokeWidth=".8" />
        </pattern>
      </defs>
    </svg>
  )
}

/**
 * The stage strip at the top of Today. Sheen walks between two amps,
 * stopping now and then to shred or dance. Real chord playback makes him
 * stop and shred. Tapping him does a jumping spin (and asks for the next tip).
 */
function SheenStage({ today, playing, onTap }: { today: string; playing: boolean; onTap: () => void }) {
  const look = sheenLook(today)
  const stageRef = useRef<HTMLDivElement>(null)
  const moverRef = useRef<HTMLButtonElement>(null)
  const x = useRef(0)
  const [mode, setMode] = useState<SheenMode>('idle')
  const [facing, setFacing] = useState<'left' | 'right' | 'front'>('front')
  const [trick, setTrick] = useState(0)

  const place = () => {
    if (moverRef.current) moverRef.current.style.transform = `translateX(${x.current}px)`
  }
  const bounds = () => {
    const w = stageRef.current?.clientWidth ?? 360
    return { min: AMP_W - 6, max: Math.max(AMP_W, w - SHEEN_W - AMP_W + 6) }
  }

  // Start on the right, like before.
  useEffect(() => {
    x.current = bounds().max
    place()
  }, [])

  // The show: walk → perform → walk … (paused while real chords play).
  useEffect(() => {
    if (playing || reducedMotion()) {
      setMode('idle')
      setFacing('front')
      return
    }
    const run = { cancelled: false, raf: 0, timer: 0 }

    const perform = () => {
      const r = Math.random()
      const [m, dur]: [SheenMode, number] = r < 0.45 ? ['shred', 2800] : r < 0.8 ? ['dance', 2400] : ['idle', 1500]
      setMode(m)
      setFacing('front')
      run.timer = window.setTimeout(walk, dur)
    }
    const walk = () => {
      if (run.cancelled) return
      const { min, max } = bounds()
      let target = x.current
      for (let tries = 0; tries < 8 && Math.abs(target - x.current) < 70; tries++) target = min + Math.random() * (max - min)
      const dir = Math.sign(target - x.current) || 1
      setMode('walk')
      setFacing(dir > 0 ? 'right' : 'left')
      let last = performance.now()
      const tick = (t: number) => {
        if (run.cancelled) return
        const dt = Math.min(0.05, (t - last) / 1000)
        last = t
        x.current += dir * WALK_SPEED * dt
        if ((dir > 0 && x.current >= target) || (dir < 0 && x.current <= target)) {
          x.current = target
          place()
          perform()
          return
        }
        place()
        run.raf = requestAnimationFrame(tick)
      }
      run.raf = requestAnimationFrame(tick)
    }

    run.timer = window.setTimeout(walk, 1200)
    return () => {
      run.cancelled = true
      cancelAnimationFrame(run.raf)
      clearTimeout(run.timer)
    }
  }, [playing])

  // Clear the stunt after it finishes so a new tap restarts it.
  useEffect(() => {
    if (!trick) return
    const t = window.setTimeout(() => setTrick(0), 1150)
    return () => clearTimeout(t)
  }, [trick])

  const shownMode: SheenMode = playing ? 'shred' : mode

  return (
    <div ref={stageRef} className="relative h-[124px] -mx-1" aria-label="Sheen's stage">
      {/* stage floor */}
      <div className="absolute inset-x-0 bottom-1 h-[3px] rounded-full bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      <div className="absolute inset-x-6 bottom-0 h-6 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(251,146,60,.18),transparent_70%)]" />
      <Amp side="left" />
      <Amp side="right" />

      <button
        ref={moverRef}
        type="button"
        onClick={() => {
          setTrick((n) => n + 1)
          onTap()
        }}
        className="absolute bottom-0 left-0 will-change-transform"
        style={{ width: SHEEN_W }}
        aria-label="Sheen the Shredder: tap for a stunt and another tip"
      >
        <div style={{ transform: facing === 'left' && shownMode === 'walk' ? 'scaleX(-1)' : undefined }}>
          <div key={trick} className={trick ? 'sheen-trick' : undefined}>
            <SheenFigure look={look} mode={shownMode} className="w-full h-auto drop-shadow-[0_6px_14px_rgba(0,0,0,.45)]" />
          </div>
        </div>
        {trick > 0 && (
          <span key={`fx${trick}`} className="pointer-events-none absolute left-1/2 top-6" aria-hidden>
            {Array.from({ length: 16 }, (_, i) => {
              const a = (i / 16) * Math.PI * 2
              return (
                <span
                  key={i}
                  className="sheen-spark absolute h-2 w-2 rounded-full"
                  style={{
                    background: FRET[i % FRET.length],
                    boxShadow: `0 0 8px ${FRET[i % FRET.length]}`,
                    ['--dx' as string]: `${Math.cos(a) * 58}px`,
                    ['--dy' as string]: `${Math.sin(a) * 46}px`,
                    animationDelay: '0.35s',
                  }}
                />
              )
            })}
            <span className="sheen-horns absolute -top-4 text-3xl" style={{ animationDelay: '0.3s' }}>
              🤘
            </span>
          </span>
        )}
      </button>
    </div>
  )
}

/** Sheen's stage at the top of Today, then the page title, then his speech bubble. */
export function SheenHeader({ today, lines, songs, children }: { today: string; lines: string[]; songs: Song[]; children: ReactNode }) {
  const player = usePlayer()
  const playing = !!player.songId
  const [i, setI] = useState(0)
  const first = lines[0]
  useEffect(() => setI(0), [first])
  const song = playing ? songs.find((s) => s.id === player.songId) : undefined
  const chord = song ? song.chords[player.chord] : undefined

  return (
    <>
      <SheenStage today={today} playing={playing} onTap={() => setI((n) => (n + 1) % lines.length)} />
      <header className="pt-1">{children}</header>
      <div className="gy-card rounded-2xl bg-surface border border-line px-3.5 py-2.5 text-sm shadow-[var(--card-shadow,none)]" aria-live="polite">
        <span className="font-display text-base text-accent mr-1.5">Sheen:</span>
        {playing && song ? (
          <span>
            Shredding <b>{song.title}</b> for you! Now playing <span className="font-display text-lg text-accent">{chord}</span> 🎸
          </span>
        ) : (
          <span>{lines[i]}</span>
        )}
        {!playing && <span className="block text-[11px] text-muted mt-1">Tap Sheen for a stunt and another tip ({i + 1}/{lines.length})</span>}
      </div>
    </>
  )
}

/** Mini Sheen that pops up in the corner on other tabs while chords play. */
export function SheenFloating({ today, songs }: { today: string; songs: Song[] }) {
  const player = usePlayer()
  if (!player.songId) return null
  const song = songs.find((s) => s.id === player.songId)
  const chord = song?.chords[player.chord]
  return (
    <div className="fixed right-3 z-40 flex items-end gap-1 pointer-events-none" style={{ bottom: 'calc(env(safe-area-inset-bottom) + 76px)' }}>
      {chord && (
        <span className="mb-16 rounded-xl bg-surface gy-card border border-line px-2.5 py-1 font-display text-xl text-accent shadow-[var(--card-shadow,none)]">{chord}</span>
      )}
      <SheenFigure look={sheenLook(today)} playing className="w-[92px] h-auto drop-shadow-[0_6px_14px_rgba(0,0,0,.5)]" />
    </div>
  )
}
