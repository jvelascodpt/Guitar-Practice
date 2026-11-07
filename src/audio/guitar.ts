import { useSyncExternalStore } from 'react'
import { audioCtx } from './metronome'
import { notesFor, voicingFor } from './chords'

/**
 * A small synthesized electric guitar for hearing a song's chord loop.
 * Strings are Karplus–Strong plucks (noise burst through a decaying delay
 * loop), run through a soft-clip "amp", a cabinet-style filter and a short
 * slapback. Strummed in the "D DU UDU" pattern at a relaxed tempo.
 */

const BPM = 90
const EIGHTH = 60 / BPM / 2
// D on 1, D-U on 2&, U on 3&, D-U on 4& (skip beat 3), like Old Faithful 2.
const PATTERN: { at: number; dir: 'down' | 'up' }[] = [
  { at: 0, dir: 'down' },
  { at: 2, dir: 'down' },
  { at: 3, dir: 'up' },
  { at: 5, dir: 'up' },
  { at: 6, dir: 'down' },
  { at: 7, dir: 'up' },
]

// ---- string synthesis (cached per note) ----
const cache = new Map<number, AudioBuffer>()
function pluck(ac: AudioContext, midi: number): AudioBuffer {
  const hit = cache.get(midi)
  if (hit) return hit
  const sr = ac.sampleRate
  const freq = 440 * 2 ** ((midi - 69) / 12)
  const period = Math.max(2, Math.round(sr / freq))
  const len = Math.floor(sr * 2.2)
  const buf = ac.createBuffer(1, len, sr)
  const out = buf.getChannelData(0)
  const ring = new Float32Array(period)
  // Slightly filtered noise burst = a pick attack that isn't too harsh.
  let prev = 0
  for (let i = 0; i < period; i++) {
    const n = Math.random() * 2 - 1
    prev = 0.6 * n + 0.4 * prev
    ring[i] = prev
  }
  // Higher strings ring a bit shorter, like a real guitar.
  const decay = 0.9965 - (midi - 40) * 0.00004
  let idx = 0
  for (let i = 0; i < len; i++) {
    const next = (idx + 1) % period
    const v = decay * 0.5 * (ring[idx] + ring[next])
    out[i] = ring[idx]
    ring[idx] = v
    idx = next
  }
  cache.set(midi, buf)
  return buf
}

function ampChain(ac: AudioContext) {
  const input = ac.createGain()
  input.gain.value = 2.2
  const drive = ac.createWaveShaper()
  const k = 6 // light crunch
  const curve = new Float32Array(1024)
  for (let i = 0; i < curve.length; i++) {
    const x = (i / (curve.length - 1)) * 2 - 1
    curve[i] = ((1 + k) * x) / (1 + k * Math.abs(x))
  }
  drive.curve = curve
  drive.oversample = '2x'
  const hp = ac.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 90
  const cab = ac.createBiquadFilter()
  cab.type = 'lowpass'
  cab.frequency.value = 4200
  cab.Q.value = 0.8
  const mid = ac.createBiquadFilter()
  mid.type = 'peaking'
  mid.frequency.value = 900
  mid.gain.value = 3
  const master = ac.createGain()
  master.gain.value = 0.28
  const slap = ac.createDelay()
  slap.delayTime.value = 0.11
  const slapGain = ac.createGain()
  slapGain.gain.value = 0.18
  input.connect(drive).connect(hp).connect(mid).connect(cab).connect(master)
  cab.connect(slap).connect(slapGain).connect(master)
  master.connect(ac.destination)
  return { input, master }
}

// ---- player state (one song at a time) ----
interface PlayerState {
  songId: string | null
  chord: number
}
let state: PlayerState = { songId: null, chord: -1 }
const listeners = new Set<() => void>()
const setState = (s: PlayerState) => {
  state = s
  listeners.forEach((l) => l())
}
export const usePlayer = () =>
  useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => state,
  )

let stopCurrent: (() => void) | null = null

export function stopChords() {
  stopCurrent?.()
  stopCurrent = null
  if (state.songId) setState({ songId: null, chord: -1 })
}

/** Strum the chord loop: each chord for one bar, repeated for ~8–16 bars. */
export function playChords(songId: string, chords: string[], capo = 0) {
  stopChords()
  const shapes = chords.map((c) => voicingFor(c)).filter((v): v is NonNullable<typeof v> => !!v)
  if (!shapes.length) return
  const ac = audioCtx()
  const { input, master } = ampChain(ac)
  const t0 = ac.currentTime + 0.12
  const bar = EIGHTH * 8
  const bars = Math.min(16, Math.max(8, shapes.length * 2))
  const timers: number[] = []
  const lastOnString: (GainNode | null)[] = Array(6).fill(null)

  for (let b = 0; b < bars; b++) {
    const ci = b % shapes.length
    const notes = notesFor(shapes[ci], capo)
    const barStart = t0 + b * bar
    timers.push(window.setTimeout(() => setState({ songId, chord: ci }), Math.max(0, (barStart - ac.currentTime) * 1000)))
    for (const { at, dir } of PATTERN) {
      const when = barStart + at * EIGHTH
      // Up-strums only catch the top 4 strings and are softer.
      const order = dir === 'down' ? [0, 1, 2, 3, 4, 5] : [5, 4, 3, 2]
      order.forEach((s, k) => {
        const midi = notes[s]
        if (midi == null) return
        const t = when + k * (dir === 'down' ? 0.012 : 0.009)
        const src = ac.createBufferSource()
        src.buffer = pluck(ac, midi)
        const g = ac.createGain()
        const vel = (dir === 'down' ? 0.5 : 0.32) * (0.9 + Math.random() * 0.2)
        g.gain.setValueAtTime(vel, t)
        src.connect(g).connect(input)
        src.start(t)
        src.stop(t + 2.2)
        // Re-striking a string cuts the previous note on it.
        const prev = lastOnString[s]
        if (prev) {
          prev.gain.setValueAtTime(prev.gain.value, Math.max(ac.currentTime, t - 0.01))
          prev.gain.linearRampToValueAtTime(0, t)
        }
        lastOnString[s] = g
      })
    }
  }
  const end = t0 + bars * bar + 1.2
  timers.push(window.setTimeout(() => stopChords(), (end - ac.currentTime) * 1000))

  setState({ songId, chord: 0 })
  stopCurrent = () => {
    timers.forEach(clearTimeout)
    const now = ac.currentTime
    master.gain.cancelScheduledValues(now)
    master.gain.setValueAtTime(master.gain.value, now)
    master.gain.linearRampToValueAtTime(0, now + 0.08)
    window.setTimeout(() => master.disconnect(), 200)
  }
}

export const getPlayingSongId = () => state.songId
