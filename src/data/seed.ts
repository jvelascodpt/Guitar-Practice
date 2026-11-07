import { addMonths } from '../lib/dates'
import { PLAN_START } from '../logic/plan'
import type { PlanMonth, Settings, Skill, Song } from './types'

type MonthSeed = Omit<PlanMonth, 'id' | 'monthKey' | 'weeks' | 'goalMet' | 'notes' | 'updatedAt'> & {
  weeks: string[]
}

const s = (name: string, extra: Partial<Skill> = {}): Skill => ({ name, ...extra })

const MONTHS: MonthSeed[] = [
  {
    title: 'Setup & first chords',
    focus: 'Tune, pick grip, clean single notes; Em Am E A D; timed chord-change drills.',
    goal: '3 chords changed cleanly at 60 bpm.',
    skills: [
      s('Tuning + pick grip', { detail: 'Tune all 6 strings with a tuner. Hold the pick lightly: thumb flat, tip just showing.' }),
      s('Clean single notes', { detail: 'Pick each open string 4×, then frets 1–3 on low E. Listen for buzz.', bpm: 60 }),
      s('Em ↔ Am changes', { detail: 'Lift and place the fingers as one unit. Slow is fine.', bpm: 60 }),
      s('E ↔ A changes', { detail: 'Keep the fingers close to the strings between shapes.', bpm: 60 }),
      s('A ↔ D changes', { bpm: 60 }),
      s('Timed 1-minute changes', { detail: 'Pick a pair, count clean changes in 60 s, note the number.', bpm: 60 }),
    ],
    weeks: [
      'Tune, pick grip, single notes on every string',
      'Em and Am ring clean',
      'E, A and D ring clean',
      '3 chords changed cleanly at 60 bpm',
    ],
    dangerZone: false,
    songFallback: 'Strum along: Em → Am → E → A, 4 downstrokes each at 60 bpm.',
  },
  {
    title: 'Open chord vocabulary',
    focus: 'Add G C Dm; downstroke strumming with metronome; first 2 songs.',
    goal: 'One song start to finish without stopping.',
    skills: [
      s('G shape', { detail: 'Let every string ring; check one string at a time.' }),
      s('C shape', { detail: 'Arch finger 3 so the G string rings.' }),
      s('Dm shape'),
      s('G ↔ C changes', { bpm: 60 }),
      s('Downstrokes on the beat', { detail: 'One strum per click; stay relaxed through the wrist.', bpm: 70 }),
      s('D ↔ G and C ↔ Am changes', { bpm: 60 }),
    ],
    weeks: [
      'G and C ring clean',
      'Dm + downstrokes on the beat',
      'Song #1: changes up to tempo',
      'Song #1 start to finish; start song #2',
    ],
    dangerZone: false,
    songFallback: 'Strum G → C → D, 4 downstrokes each at 70 bpm.',
  },
  {
    title: 'Rhythm & strumming',
    focus: 'Up/down patterns, muting, counting 8ths; finger-independence warm-ups.',
    goal: '5 songs in rotation, changes at 80 bpm.',
    skills: [
      s('Counting 8ths: 1 & 2 &', { detail: 'Say it out loud while you strum.', bpm: 70 }),
      s('Down-up 8th-note strumming', { bpm: 70 }),
      s('Pattern D-D-U-U-D-U', { bpm: 70 }),
      s('Fretting-hand muting (chucks)', { bpm: 70 }),
      s('Chord changes at 80 bpm', { bpm: 80 }),
      s('Finger independence: 1-2-3-4 spider', { bpm: 60 }),
    ],
    weeks: [
      'Count and strum straight 8ths',
      'D-D-U-U-D-U on one chord',
      'Muted chucks; pattern across changes',
      'Changes at 80 bpm; 5 songs in rotation',
    ],
    dangerZone: false,
    songFallback: 'D-D-U-U-D-U on G → Em → C → D at 70 bpm.',
  },
  {
    title: 'Power chords & palm muting',
    focus: 'Root-5/root-6 shapes, sliding, palm muting with gain; 2 rock riffs.',
    goal: 'One riff clean at tempo.',
    skills: [
      s('Root-6 power chords', { bpm: 70 }),
      s('Root-5 power chords', { bpm: 70 }),
      s('Sliding power chords', { bpm: 70 }),
      s('Palm muting with gain', { detail: 'Side of the picking hand rests right at the bridge.', bpm: 80 }),
      s('Riff #1: slow → tempo'),
      s('Riff #2: slow → tempo'),
    ],
    weeks: ['Root-6 and root-5 shapes', 'Slides between shapes', 'Palm-muted 8ths with gain', 'One riff clean at tempo'],
    dangerZone: false,
    songFallback: 'Palm-muted 8ths on E5 → G5 → A5 at 80 bpm.',
  },
  {
    title: 'Minor pentatonic position 1',
    focus: 'A minor box, alternate picking, play over backing track, first bends.',
    goal: 'Scale clean at 100 bpm 8ths; first 4-bar solo.',
    skills: [
      s('A minor pentatonic box (5th fret)', { bpm: 70 }),
      s('Alternate picking on the box', { bpm: 80 }),
      s('First bends (G string, half step)'),
      s('Licks over an A minor backing track'),
      s('Scale at 100 bpm 8ths', { bpm: 90, bpmStep: 1, bpmMax: 100 }),
      s('Write a 4-bar solo'),
    ],
    weeks: [
      'Box up and down from memory',
      'Alternate picking at 80 bpm',
      'First bends + jam over a backing track',
      'Scale at 100 bpm; 4-bar solo',
    ],
    dangerZone: false,
    songFallback: 'Noodle on the A minor box over a backing track.',
  },
  {
    title: 'Barre chords',
    focus: 'F and B shapes, short frequent reps to build strength safely; transpose a known song.',
    goal: 'F major rings clean 8/10 times.',
    skills: [
      s('Mini-F (top 4 strings)'),
      s('Full F barre: press, check, release', {
        detail: '30 s on, 30 s off. Light pressure; let arm weight do the work, not grip.',
      }),
      s('B-shape (A-shape barre)'),
      s('F ↔ C changes', { bpm: 60 }),
      s('Transpose a known song with barres'),
      s('F check: clean rings out of 10'),
    ],
    weeks: [
      'Mini-F + barre press/release reps',
      'Full F rings on most strings',
      'B-shape + changes into barres',
      'F clean 8/10; transpose one song',
    ],
    dangerZone: true,
    dangerNote:
      'Barre chords are a classic quit point. Technique blocks are shorter this month and you get an extra song slot. Short, frequent reps build strength without overloading the hand.',
    songFallback: 'Play a song you know, swapping one chord for its barre version.',
  },
  {
    title: 'Expression',
    focus: 'Vibrato, in-tune bends, hammer-ons/pull-offs; first solo note-for-note.',
    goal: 'The solo at 75% tempo.',
    skills: [
      s('Vibrato on held notes'),
      s('In-tune bends', { detail: 'Fret the target note first, then bend up to match it.' }),
      s('Hammer-ons & pull-offs'),
      s('Solo: phrase 1'),
      s('Solo: phrase 2'),
      s('Solo phrases joined at 75%'),
    ],
    weeks: ['Vibrato + hammer-ons/pull-offs', 'Bends in tune; solo phrase 1', 'Solo phrases 2–3', 'Whole solo at 75% tempo'],
    dangerZone: true,
    dangerNote:
      'First solo month: another common quit point. Technique blocks are shorter and you get an extra song slot. Learn the solo in phrases; slow and right beats fast and messy.',
    songFallback: 'Play the A minor box with vibrato on every last note.',
  },
  {
    title: 'Connecting the neck',
    focus: 'Pentatonic positions 2–3, shifting; 12-bar blues, shuffle feel.',
    goal: 'Improvise 12 bars without stopping.',
    skills: [
      s('Pentatonic position 2'),
      s('Pentatonic position 3'),
      s('Shifting between positions 1–3'),
      s('12-bar blues in A: shuffle rhythm', { bpm: 80 }),
      s('Shuffle feel: swung 8ths', { bpm: 80 }),
      s('Improvise over a 12-bar backing track'),
    ],
    weeks: ['Position 2', 'Position 3 + shifting', '12-bar shuffle rhythm', 'Improvise 12 bars without stopping'],
    dangerZone: false,
    songFallback: 'Shuffle through a 12-bar blues in A at 80 bpm.',
  },
  {
    title: 'Ear training & songs',
    focus: '3 riffs by ear; 2 full songs with chords + lead.',
    goal: '10-song repertoire.',
    skills: [
      s('Find the first note by ear'),
      s('Riff #1 by ear'),
      s('Riff #2 by ear'),
      s('Riff #3 by ear'),
      s('Full song: rhythm part'),
      s('Full song: lead part'),
    ],
    weeks: ['Riff #1 by ear', 'Riffs #2 and #3 by ear', 'Full song #1: chords + lead', 'Full song #2; 10-song repertoire'],
    dangerZone: false,
    songFallback: 'Pick out a melody you know by ear on one string.',
  },
  {
    title: 'Technique push',
    focus: 'Metronome speed work (+2–3 bpm/day), string skipping, arpeggios; major scale/CAGED basics.',
    goal: 'Pentatonic at 140 bpm 8ths.',
    skills: [
      s('Pentatonic speed ladder', { detail: 'Clean at this tempo? Tomorrow it goes up 2–3 bpm.', bpm: 110, bpmStep: 2, bpmMax: 140 }),
      s('String skipping'),
      s('Major & minor arpeggios'),
      s('Major scale (one position)'),
      s('CAGED: C and A shapes'),
      s('CAGED: G, E and D shapes'),
    ],
    weeks: ['Speed ladder from 110 bpm', 'String skipping + arpeggios', 'Major scale + CAGED basics', 'Pentatonic at 140 bpm 8ths'],
    dangerZone: false,
    songFallback: 'Improvise over a backing track using today’s tempo.',
  },
  {
    title: 'Tone & gear',
    focus: 'Amp gain staging/EQ, clean vs crunch, try pedals; record with backing track and compare to Nov.',
    goal: 'A 1-minute clip I’m proud of.',
    skills: [
      s('Gain staging: find the edge of breakup'),
      s('EQ sweep: bass / mid / treble'),
      s('Clean vs crunch on the same riff'),
      s('Try a pedal or amp-sim effect'),
      s('Record over a backing track'),
      s('Polish the 1-minute clip'),
    ],
    weeks: ['Gain staging + EQ', 'Clean vs crunch', 'Pedals / effects', 'Record a 1-minute clip; compare to Nov'],
    dangerZone: false,
    songFallback: 'Play a song you know with two different tones.',
  },
  {
    title: 'Perform & plan year 2',
    focus: 'Play for someone or post a clip; choose next direction.',
    goal: '15 songs, one solo at full speed, confident improv.',
    skills: [
      s('Set-list run-through (3 songs)'),
      s('Solo at full speed'),
      s('Improvise over a new backing track'),
      s('Performance take: play it like it counts'),
      s('Fix weak spots from the run-through'),
      s('Try a year-2 direction'),
    ],
    weeks: ['Pick a 3-song set; run it daily', 'Solo at full speed', 'Play for someone or post a clip', 'Choose a year-2 direction'],
    dangerZone: false,
    songFallback: 'Run your 3-song set top to bottom.',
  },
]

export function seedPlan(now = Date.now()): PlanMonth[] {
  return MONTHS.map((m, i) => ({
    ...m,
    id: i,
    monthKey: addMonths(PLAN_START, i),
    weeks: m.weeks.map((label) => ({ label, done: false })),
    goalMet: false,
    notes: '',
    updatedAt: now,
  }))
}

/** Warm-up rotation; `from` is the first plan month an item appears. */
export const WARMUPS: { name: string; from: number; bpm?: number }[] = [
  { name: 'Chromatic 1-2-3-4 on low E & A', from: 0, bpm: 60 },
  { name: 'Open-string picking, slow and even', from: 0, bpm: 60 },
  { name: 'Chord-shape squeeze & release (light grip)', from: 0 },
  { name: 'Spider exercise across 3 strings', from: 2, bpm: 60 },
  { name: 'Palm-muted open strings', from: 3, bpm: 80 },
  { name: 'Pentatonic box up & down, slow', from: 4, bpm: 70 },
  { name: 'Hammer-on / pull-off trills', from: 6 },
  { name: 'String skipping on the box', from: 8, bpm: 80 },
]

const lesson = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q + ' guitar lesson')}`
const chordsSearch = (q: string) => `https://www.ultimate-guitar.com/search.php?search_type=title&value=${encodeURIComponent(q)}`
const listen = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`

type SongSeed = Pick<Song, 'title' | 'artist' | 'difficulty' | 'chords' | 'techniques' | 'tier' | 'targetMonth' | 'notes' | 'tags' | 'link'>

const F_TIP = 'Until barre month (April), play Fmaj7 (x x 3 2 1 0) wherever the sheet says F.'
const CHECK = 'Chord sheets for this one disagree; check against the recording.'

/**
 * Library built from the user's artists (Nov 2026): 10 easy / 4 stretch, ordered to match the plan.
 * EDM tracks are played as their chord loop + the synth hook as a single-note riff.
 */
export const SONGS: SongSeed[] = [
  // Dec: open chords, first 2 songs
  { title: 'Heroes (We Could Be)', artist: 'Alesso ft. Tove Lo', difficulty: 1, chords: ['Am', 'G', 'C'], techniques: ['Capo 5', '3-chord loop', 'Downstrokes'], tier: 'easy', targetMonth: 1, tags: ['edm'], notes: 'Capo 5. Three chords on repeat; a good first song.', link: chordsSearch('Heroes We Could Be Alesso') },
  { title: 'Feel So Close', artist: 'Calvin Harris', difficulty: 1, chords: ['Am', 'Em', 'G', 'C'], techniques: ['4-chord loop', 'Strumming'], tier: 'easy', targetMonth: 1, tags: ['edm'], notes: 'No capo. Strum the loop first; the single-note intro riff makes a fun extra later.', link: chordsSearch('Feel So Close Calvin Harris') },
  // Jan: rhythm & strumming, 5 songs in rotation
  { title: 'Count On Me', artist: 'Bruno Mars', difficulty: 2, chords: ['C', 'Em', 'Am', 'G', 'F', 'Dm'], techniques: ['Strumming pattern', 'Chord changes'], tier: 'easy', targetMonth: 2, tags: ['pop'], notes: `Key of C, no capo. ${F_TIP}`, link: chordsSearch('Count On Me Bruno Mars') },
  { title: 'Love Yourself', artist: 'Justin Bieber', difficulty: 2, chords: ['C', 'G', 'Am', 'F'], techniques: ['Capo 4', 'Strumming'], tier: 'easy', targetMonth: 2, tags: ['pop'], notes: `Capo 4, easy-shapes version. ${F_TIP}`, link: chordsSearch('Love Yourself Justin Bieber') },
  { title: 'Gravity (rhythm part)', artist: 'John Mayer', difficulty: 2, chords: ['G', 'C', 'Am', 'D7'], techniques: ['6/8 feel', 'Slow strumming'], tier: 'easy', targetMonth: 2, tags: ['blues'], notes: 'Mostly G and C at a slow 6/8 sway. Learn this before the solo in May.', link: lesson('Gravity John Mayer') },
  { title: 'Scared to Be Lonely', artist: 'Martin Garrix & Dua Lipa', difficulty: 2, chords: ['F', 'Am', 'G', 'Em'], techniques: ['Capo 4', '4-chord loop'], tier: 'easy', targetMonth: 2, tags: ['edm'], notes: `Capo 4 version. ${F_TIP} ${CHECK}`, link: chordsSearch('Scared to Be Lonely Martin Garrix') },
  // Feb: muting & riffs
  { title: 'Uptown Funk', artist: 'Mark Ronson ft. Bruno Mars', difficulty: 2, chords: ['Dm7', 'G7'], techniques: ['Funk muting', 'Short chord stabs'], tier: 'easy', targetMonth: 3, tags: ['pop', 'funk'], notes: 'Two chords; the groove is the hard part. Play the stabs short and mute in between.', link: lesson('Uptown Funk Mark Ronson Bruno Mars') },
  { title: 'Animals (lead riff)', artist: 'Martin Garrix', difficulty: 2, chords: [], techniques: ['Single-note riff', 'Palm muting'], tier: 'easy', targetMonth: 3, tags: ['edm'], notes: 'The synth hook arranged for guitar. Slow it right down, then build to tempo.', link: lesson('Animals Martin Garrix') },
  { title: 'Locked Out of Heaven', artist: 'Bruno Mars', difficulty: 3, chords: ['D', 'G', 'Em', 'A'], techniques: ['Capo 3', 'Syncopated upstrokes', 'Muting'], tier: 'stretch', targetMonth: 3, tags: ['pop'], notes: `Reggae-rock rhythm in the style of The Police. Capo 3 version. ${CHECK}`, link: chordsSearch('Locked Out of Heaven Bruno Mars') },
  // Apr–Jun: barre chords, first solo, pentatonic
  { title: 'Slow Dancing in a Burning Room (rhythm)', artist: 'John Mayer', difficulty: 4, chords: ['C#m', 'A', 'E', 'B'], techniques: ['Barre chords', 'Dynamics'], tier: 'stretch', targetMonth: 5, tags: ['blues'], notes: 'Original-key barre version for barre month. Many tabs also show a capo 4 version.', link: lesson('Slow Dancing in a Burning Room John Mayer') },
  { title: 'Gravity (solo)', artist: 'John Mayer', difficulty: 4, chords: [], techniques: ['Bends', 'Vibrato', 'G major pentatonic'], tier: 'stretch', targetMonth: 6, tags: ['blues'], notes: 'Your first solo note for note. Slow and bendy, so tone beats speed. Aim for 75% tempo.', link: lesson('Gravity John Mayer solo') },
  { title: 'Slow Dancing in a Burning Room (solo)', artist: 'John Mayer', difficulty: 4, chords: [], techniques: ['C#m pentatonic, positions 1–2', 'Bends'], tier: 'stretch', targetMonth: 7, tags: ['blues'], notes: 'Uses the same pentatonic positions as June’s plan.', link: lesson('Slow Dancing in a Burning Room solo') },
  // Jul: ear training
  { title: 'Where You Are', artist: 'John Summit & Hayla', difficulty: 2, chords: [], techniques: ['By ear', 'Chord loop', 'Vocal hook'], tier: 'easy', targetMonth: 8, tags: ['edm', 'by ear'], notes: 'Ear-training song: find the chord loop and the vocal hook yourself. (The Zedd remix chord sheet is in A minor.)', link: listen('John Summit Hayla Where You Are') },
  { title: 'Food for the Soul', artist: 'it’s murph', difficulty: 2, chords: [], techniques: ['By ear', 'Synth hook as a riff'], tier: 'easy', targetMonth: 8, tags: ['edm', 'by ear'], notes: 'Ear-training song: no tabs exist, so work out the main melody one string at a time.', link: listen('its murph Food for the Soul') },
]

export function seedSongs(now = Date.now(), startOrder = 1): Song[] {
  return SONGS.map((x, i) => ({
    ...x,
    id: `seed-v2-${i + 1}`,
    status: 'queued',
    order: startOrder + i,
    createdAt: now,
    updatedAt: now,
  }))
}

export function defaultSettings(now = Date.now()): Settings {
  return {
    id: 'settings',
    onboarded: false,
    anchor: 'after coffee',
    reminderTime: '19:00',
    remindersEnabled: false,
    sessionCapMinutes: 30,
    weeklyTargetDays: 5,
    theme: 'spruce',
    introClip: true,
    updatedAt: now,
  }
}
