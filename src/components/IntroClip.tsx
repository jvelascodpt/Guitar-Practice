import { useEffect, useRef, useState } from 'react'

export const INTRO_CREDIT = {
  title: 'FAST GUITAR SOLO',
  author: 'Guitinst72',
  license: 'CC BY 4.0',
  source: 'https://commons.wikimedia.org/wiki/File:FAST_GUITAR_SOLO.webm',
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
}

/** Lets Settings replay the intro on demand. */
export const introEvents = new EventTarget()

// ---- diagnostics: last few intro events, shown under More → Practice settings ----
const LOG_KEY = 'gy.introLog'
export function introLog(msg: string) {
  try {
    const t = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })
    const prev: string[] = JSON.parse(localStorage.getItem(LOG_KEY) ?? '[]')
    localStorage.setItem(LOG_KEY, JSON.stringify([...prev, `${t} ${msg}`].slice(-12)))
  } catch {
    /* storage unavailable */
  }
}
export function readIntroLog(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LOG_KEY) ?? '[]')
  } catch {
    return []
  }
}

const CLIP_MS = 3_000
/** How long the still frame waits for a tap when the clip can't autoplay. */
const STILL_MS = 4_000

const base = import.meta.env.BASE_URL
const DIRECT = `${base}intro/shred.mp4`

/**
 * 3-second muted shred clip. Tap to skip.
 * Load order: blob from the offline cache (iOS can't play range-requested
 * video out of a service-worker cache) → plain URL if that fails. If the clip
 * can't autoplay or can't load at all, the first frame shows with a ▶ so a tap
 * can start it (a tap is always allowed to play media). Every step is logged.
 */
export function IntroClip({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [src, setSrc] = useState<string>()
  const [still, setStill] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  const triedDirect = useRef(false)

  const finish = (why: string) => {
    window.clearTimeout(timer.current)
    introLog(`closed (${why})`)
    setLeaving(true)
    window.setTimeout(onDone, 250)
  }
  const finishIn = (ms: number, why: string) => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => finish(why), ms)
  }
  const showStill = (why: string) => {
    introLog(why)
    setStill(true)
    finishIn(STILL_MS, 'still frame timed out')
  }

  useEffect(() => {
    introLog(`opened · ${navigator.userAgent.match(/(iPhone|iPad|Android)[^;)]*/)?.[0] ?? 'desktop'}`)
    let url: string | undefined
    let cancelled = false
    fetch(DIRECT)
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((b) => {
        if (cancelled) return
        introLog(`loaded ${Math.round(b.size / 1024)} KB ${b.type || '(no type)'}`)
        url = URL.createObjectURL(b.type ? b : new Blob([b], { type: 'video/mp4' }))
        setSrc(url)
      })
      .catch((e: Error) => {
        if (cancelled) return
        introLog(`load failed: ${e.message}; trying direct`)
        triedDirect.current = true
        setSrc(DIRECT)
      })
    return () => {
      cancelled = true
      window.clearTimeout(timer.current)
      if (url) URL.revokeObjectURL(url)
    }
  }, [])

  const play = (byTap: boolean) => {
    const v = ref.current
    if (!v) return
    v.muted = true
    v.defaultMuted = true
    v.setAttribute('muted', '')
    v.setAttribute('playsinline', '')
    v.play().then(
      () => {
        introLog(byTap ? 'playing (after tap)' : 'playing')
        setStill(false)
        finishIn(CLIP_MS + 200, 'done')
      },
      (e: DOMException) => showStill(`autoplay refused: ${e.name}`),
    )
  }

  useEffect(() => {
    if (src) play(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src])

  const onError = () => {
    const code = ref.current?.error?.code
    if (!triedDirect.current) {
      triedDirect.current = true
      introLog(`video error ${code ?? '?'} on cached copy; trying direct`)
      setSrc(DIRECT)
    } else {
      showStill(`video error ${code ?? '?'}; showing still`)
    }
  }

  return (
    <button
      type="button"
      aria-label={still ? 'Play intro' : 'Skip intro'}
      onClick={() => (still ? play(true) : finish('tapped'))}
      className={`fixed inset-0 z-[60] bg-black transition-opacity duration-200 ${leaving ? 'opacity-0' : 'opacity-100'}`}
    >
      <video
        ref={ref}
        src={src}
        poster={`${base}intro/shred-poster.jpg`}
        muted
        playsInline
        preload="auto"
        onEnded={() => finish('ended')}
        onError={onError}
        className="h-full w-full object-contain"
      />
      {still && (
        <span className="absolute inset-0 grid place-items-center" aria-hidden>
          <span className="h-20 w-20 rounded-full bg-white/90 text-black grid place-items-center text-3xl pl-1">▶</span>
        </span>
      )}
      <div className="absolute inset-x-0 bottom-0 p-5 pb-8 safe-bottom bg-gradient-to-t from-black/80 to-transparent text-left">
        <div className="text-2xl font-bold text-white">Guitar Year</div>
        <div className="mt-1 flex items-end justify-between text-[11px] text-white/60">
          <span>
            “{INTRO_CREDIT.title}” by {INTRO_CREDIT.author}, {INTRO_CREDIT.license}
          </span>
          <span className="text-white/80 text-xs">{still ? 'Tap to play' : 'Tap to skip'}</span>
        </div>
      </div>
    </button>
  )
}
