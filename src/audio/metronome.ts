/** Web Audio metronome with a look-ahead scheduler (steady even when the UI is busy). */
type Listener = (beat: number) => void

let ctx: AudioContext | null = null
export function audioCtx(): AudioContext {
  ctx ??= new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

export class Metronome {
  bpm = 60
  beatsPerBar = 4
  private timer: number | null = null
  private nextTime = 0
  private beat = 0
  private listeners = new Set<Listener>()

  get running() {
    return this.timer !== null
  }

  onBeat(fn: Listener) {
    this.listeners.add(fn)
    return () => {
      this.listeners.delete(fn)
    }
  }

  start() {
    if (this.timer !== null) return
    const ac = audioCtx()
    this.beat = 0
    this.nextTime = ac.currentTime + 0.06
    this.timer = window.setInterval(() => this.schedule(), 25)
    this.schedule()
  }

  stop() {
    if (this.timer !== null) clearInterval(this.timer)
    this.timer = null
  }

  private schedule() {
    const ac = audioCtx()
    while (this.nextTime < ac.currentTime + 0.12) {
      const accent = this.beat % this.beatsPerBar === 0
      const osc = ac.createOscillator()
      const gain = ac.createGain()
      osc.frequency.value = accent ? 1600 : 1000
      gain.gain.setValueAtTime(0.0001, this.nextTime)
      gain.gain.exponentialRampToValueAtTime(accent ? 0.6 : 0.35, this.nextTime + 0.002)
      gain.gain.exponentialRampToValueAtTime(0.0001, this.nextTime + 0.05)
      osc.connect(gain).connect(ac.destination)
      osc.start(this.nextTime)
      osc.stop(this.nextTime + 0.06)
      const b = this.beat % this.beatsPerBar
      const delay = Math.max(0, (this.nextTime - ac.currentTime) * 1000)
      window.setTimeout(() => this.listeners.forEach((l) => l(b)), delay)
      this.nextTime += 60 / this.bpm
      this.beat++
    }
  }
}

export const metronome = new Metronome()

/** Soft two-note chime for "next item". */
export function chime() {
  try {
    const ac = audioCtx()
    ;[660, 880].forEach((f, i) => {
      const t = ac.currentTime + i * 0.16
      const osc = ac.createOscillator()
      const gain = ac.createGain()
      osc.type = 'sine'
      osc.frequency.value = f
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.3, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5)
      osc.connect(gain).connect(ac.destination)
      osc.start(t)
      osc.stop(t + 0.55)
    })
  } catch {
    /* audio unavailable */
  }
}
