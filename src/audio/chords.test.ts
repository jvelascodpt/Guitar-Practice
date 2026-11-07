import { describe, expect, it } from 'vitest'
import { capoOf, notesFor, parseChord, soundingName, voicingFor } from './chords'
import { seedSongs } from '../data/seed'

describe('chord voicings', () => {
  it('uses real open shapes for common chords', () => {
    expect(voicingFor('Am')).toEqual([null, 0, 2, 2, 1, 0])
    expect(voicingFor('G')).toEqual([3, 2, 0, 0, 0, 3])
    expect(voicingFor('D7')).toEqual([null, null, 0, 2, 1, 2])
    expect(voicingFor('C#m')).toEqual([null, 4, 6, 6, 5, 4])
  })
  it('builds power chords and barre fallbacks', () => {
    expect(voicingFor('F5')).toEqual([1, 3, 3, null, null, null])
    expect(voicingFor('B♭5')).toEqual([6, 8, 8, null, null, null])
    expect(voicingFor('A♭5')).toEqual([4, 6, 6, null, null, null])
    expect(voicingFor('G#')).toEqual([4, 6, 6, 5, 4, 4]) // E-shape at fret 4
    expect(voicingFor('Bbm')).toEqual([6, 8, 8, 6, 6, 6])
  })
  it('handles slash chords and junk', () => {
    expect(voicingFor('G/B')).toEqual(voicingFor('G'))
    expect(voicingFor('xyz')).toBeNull()
    expect(parseChord('D♭5')).toEqual({ root: 1, quality: '5' })
  })
  it('capo transposes the notes and the sounding name', () => {
    expect(notesFor(voicingFor('Am')!, 5)).toEqual([null, 50, 57, 62, 65, 69])
    expect(soundingName('Am', 5)).toBe('Dm')
    expect(capoOf(['Capo 5', '3-chord loop'])).toBe(5)
    expect(capoOf(['Capo 4 version. Until barre month…'])).toBe(4)
    expect(capoOf(['Strumming'])).toBe(0)
  })
  it('every chord in the song library has a voicing', () => {
    const missing = seedSongs().flatMap((s) => s.chords).filter((c) => !voicingFor(c))
    expect(missing).toEqual([])
  })
})
