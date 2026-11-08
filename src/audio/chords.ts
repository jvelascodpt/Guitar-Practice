/**
 * Chord name → guitar voicing (frets per string, low E → high e; null = not
 * played). Common open shapes come from a table so they sound like a real
 * guitar; anything else falls back to a movable barre shape built from the
 * root and quality.
 */
export type Voicing = (number | null)[]

/** Standard tuning as MIDI notes, low E → high e. */
export const TUNING = [40, 45, 50, 55, 59, 64]

const x = null
const OPEN: Record<string, Voicing> = {
  C: [x, 3, 2, 0, 1, 0],
  D: [x, x, 0, 2, 3, 2],
  E: [0, 2, 2, 1, 0, 0],
  F: [1, 3, 3, 2, 1, 1],
  G: [3, 2, 0, 0, 0, 3],
  A: [x, 0, 2, 2, 2, 0],
  B: [x, 2, 4, 4, 4, 2],
  Am: [x, 0, 2, 2, 1, 0],
  Bm: [x, 2, 4, 4, 3, 2],
  Cm: [x, 3, 5, 5, 4, 3],
  'C#m': [x, 4, 6, 6, 5, 4],
  Dm: [x, x, 0, 2, 3, 1],
  Em: [0, 2, 2, 0, 0, 0],
  Fm: [1, 3, 3, 1, 1, 1],
  'F#m': [2, 4, 4, 2, 2, 2],
  Gm: [3, 5, 5, 3, 3, 3],
  A7: [x, 0, 2, 0, 2, 0],
  B7: [x, 2, 1, 2, 0, 2],
  C7: [x, 3, 2, 3, 1, 0],
  D7: [x, x, 0, 2, 1, 2],
  E7: [0, 2, 0, 1, 0, 0],
  G7: [3, 2, 0, 0, 0, 1],
  Am7: [x, 0, 2, 0, 1, 0],
  Dm7: [x, x, 0, 2, 1, 1],
  Em7: [0, 2, 2, 0, 3, 0],
  Cmaj7: [x, 3, 2, 0, 0, 0],
  Fmaj7: [x, x, 3, 2, 1, 0],
  Asus2: [x, 0, 2, 2, 0, 0],
  Asus4: [x, 0, 2, 2, 3, 0],
  Dsus2: [x, x, 0, 2, 3, 0],
  Dsus4: [x, x, 0, 2, 3, 3],
  D7sus2: [x, x, 0, 2, 1, 0],
  G7sus4: [3, 3, 0, 0, 1, 1],
}

const PC: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

/** Movable E-shape (root on the low E string) by quality; offsets from the root fret. */
const E_SHAPES: Record<string, Voicing> = {
  '': [0, 2, 2, 1, 0, 0],
  m: [0, 2, 2, 0, 0, 0],
  '7': [0, 2, 0, 1, 0, 0],
  m7: [0, 2, 0, 0, 0, 0],
  maj7: [0, x, 1, 1, 0, x],
  sus4: [0, 2, 2, 2, 0, 0],
  '5': [0, 2, 2, x, x, x],
}

export function parseChord(name: string): { root: number; quality: string } | null {
  const m = name
    .trim()
    .replace(/♭/g, 'b')
    .replace(/♯/g, '#')
    .match(/^([A-G])([#b]?)([^/]*)/)
  if (!m) return null
  let root = PC[m[1]]
  if (m[2] === '#') root += 1
  if (m[2] === 'b') root -= 1
  return { root: (root + 12) % 12, quality: m[3].trim() }
}

export function voicingFor(name: string): Voicing | null {
  const p = parseChord(name)
  if (!p) return null
  const key = SHARP_NAMES[p.root] + p.quality
  if (OPEN[key]) return OPEN[key]
  // Power chords: root on the low E string, 5th and octave above.
  const q = p.quality === '5' ? '5' : p.quality
  const shapeKey =
    q in E_SHAPES ? q : q.startsWith('m') && !q.startsWith('maj') ? (q.includes('7') ? 'm7' : 'm') : q.includes('7') ? '7' : q.startsWith('sus') ? 'sus4' : ''
  const shape = E_SHAPES[shapeKey]
  const fret = (p.root - 4 + 12) % 12 // E string is pitch class 4
  return shape.map((o) => (o === null ? null : o + fret))
}

/** MIDI notes for a voicing, transposed up by `capo` frets. */
export function notesFor(v: Voicing, capo = 0): (number | null)[] {
  return v.map((f, i) => (f === null ? null : TUNING[i] + f + capo))
}

/** Capo position mentioned in a song's techniques or notes ("Capo 5"), else 0. */
export function capoOf(texts: string[]): number {
  for (const t of texts) {
    const m = t.match(/capo\s*(\d{1,2})/i)
    if (m) return Number(m[1])
  }
  return 0
}

/** The pitch you actually hear for a chord shape played with a capo, e.g. Am + capo 5 → Dm. */
export function soundingName(name: string, capo: number): string {
  if (!capo) return name
  const p = parseChord(name)
  if (!p) return name
  return SHARP_NAMES[(p.root + capo) % 12] + p.quality
}
