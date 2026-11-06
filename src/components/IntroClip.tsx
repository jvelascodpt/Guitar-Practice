import { useEffect, useRef, useState } from 'react'

export const INTRO_CREDIT = {
  title: 'FAST GUITAR SOLO',
  author: 'Guitinst72',
  license: 'CC BY 4.0',
  source: 'https://commons.wikimedia.org/wiki/File:FAST_GUITAR_SOLO.webm',
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
}

const MAX_MS = 3_000

/**
 * 3-second muted shred clip shown once per app launch. Tap anywhere to skip.
 * The video is fetched as a blob (served from the offline cache) rather than
 * streamed, because iOS Safari can't play range-requested video from a
 * service-worker cache. If autoplay is blocked (e.g. iPhone Low Power Mode)
 * or the clip fails, it gets out of the way immediately.
 */
export function IntroClip({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [src, setSrc] = useState<string>()
  const [leaving, setLeaving] = useState(false)

  const finish = () => {
    setLeaving(true)
    window.setTimeout(onDone, 250)
  }

  useEffect(() => {
    let url: string | undefined
    let cancelled = false
    fetch(`${import.meta.env.BASE_URL}intro/shred.mp4`)
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
      .then((b) => {
        if (cancelled) return
        url = URL.createObjectURL(b)
        setSrc(url)
      })
      .catch(onDone)
    // Safety net: never hold the app up for long, even if loading stalls.
    const guard = window.setTimeout(onDone, MAX_MS + 2_000)
    return () => {
      cancelled = true
      clearTimeout(guard)
      if (url) URL.revokeObjectURL(url)
    }
  }, [onDone])

  useEffect(() => {
    const v = ref.current
    if (!v || !src) return
    v.play().catch(onDone)
    const stop = window.setTimeout(finish, MAX_MS)
    return () => clearTimeout(stop)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src])

  return (
    <button
      type="button"
      aria-label="Skip intro"
      onClick={finish}
      className={`fixed inset-0 z-[60] bg-black transition-opacity duration-200 ${leaving ? 'opacity-0' : 'opacity-100'}`}
    >
      <video
        ref={ref}
        src={src}
        poster={`${import.meta.env.BASE_URL}intro/shred-poster.jpg`}
        muted
        playsInline
        autoPlay
        preload="auto"
        onEnded={finish}
        onError={onDone}
        className="h-full w-full object-contain"
      />
      <div className="absolute inset-x-0 bottom-0 p-5 pb-8 safe-bottom bg-gradient-to-t from-black/80 to-transparent text-left">
        <div className="text-2xl font-bold text-white">Guitar Year</div>
        <div className="mt-1 flex items-end justify-between text-[11px] text-white/60">
          <span>
            “{INTRO_CREDIT.title}” by {INTRO_CREDIT.author}, {INTRO_CREDIT.license}
          </span>
          <span className="text-white/80 text-xs">Tap to skip</span>
        </div>
      </div>
    </button>
  )
}
