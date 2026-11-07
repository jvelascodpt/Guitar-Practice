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

const CLIP_MS = 3_000
/** How long to wait for a tap when the phone refuses to autoplay. */
const BLOCKED_MS = 4_000

const base = import.meta.env.BASE_URL

/**
 * 3-second muted shred clip. Tap to skip.
 * - Loaded as a blob (from the offline cache): iOS Safari can't play
 *   range-requested video out of a service-worker cache.
 * - `muted` is set as both property and attribute before play(), because
 *   iOS checks the attribute and React only sets the property.
 * - If autoplay is refused (e.g. iPhone Low Power Mode), the first frame
 *   shows with a play button; tapping plays it, since a tap is allowed.
 */
export function IntroClip({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [src, setSrc] = useState<string>()
  const [blocked, setBlocked] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  const finish = () => {
    window.clearTimeout(timer.current)
    setLeaving(true)
    window.setTimeout(onDone, 250)
  }
  const finishIn = (ms: number) => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(finish, ms)
  }

  useEffect(() => {
    let url: string | undefined
    let cancelled = false
    fetch(`${base}intro/shred.mp4`)
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
      .then((b) => {
        if (cancelled) return
        url = URL.createObjectURL(b)
        setSrc(url)
      })
      .catch(() => !cancelled && onDone())
    return () => {
      cancelled = true
      window.clearTimeout(timer.current)
      if (url) URL.revokeObjectURL(url)
    }
  }, [onDone])

  const play = () => {
    const v = ref.current
    if (!v) return
    v.muted = true
    v.defaultMuted = true
    v.setAttribute('muted', '')
    v.setAttribute('playsinline', '')
    v.play().then(
      () => {
        setBlocked(false)
        finishIn(CLIP_MS + 200)
      },
      () => {
        setBlocked(true)
        finishIn(BLOCKED_MS)
      },
    )
  }

  useEffect(() => {
    if (src) play()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src])

  return (
    <button
      type="button"
      aria-label={blocked ? 'Play intro' : 'Skip intro'}
      onClick={blocked ? play : finish}
      className={`fixed inset-0 z-[60] bg-black transition-opacity duration-200 ${leaving ? 'opacity-0' : 'opacity-100'}`}
    >
      <video
        ref={ref}
        src={src}
        poster={`${base}intro/shred-poster.jpg`}
        muted
        playsInline
        preload="auto"
        onEnded={finish}
        onError={onDone}
        className="h-full w-full object-contain"
      />
      {blocked && (
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
          <span className="text-white/80 text-xs">{blocked ? 'Tap to play' : 'Tap to skip'}</span>
        </div>
      </div>
    </button>
  )
}
