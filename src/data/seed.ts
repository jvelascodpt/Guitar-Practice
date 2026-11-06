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

const yt = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q + ' guitar lesson')}`

type SongSeed = Pick<Song, 'title' | 'artist' | 'difficulty' | 'chords' | 'techniques' | 'tier' | 'targetMonth' | 'notes'>

/** Placeholder library: 7 easy / 3 stretch, ordered to match the plan. Replace once song preferences are in. */
const SONGS: SongSeed[] = [
  { title: 'Wild Thing', artist: 'The Troggs', difficulty: 1, chords: ['A', 'D', 'E'], techniques: ['Open chords', 'Downstrokes'], tier: 'easy', targetMonth: 1, notes: 'Uses November’s chords.' },
  { title: 'A Horse with No Name', artist: 'America', difficulty: 1, chords: ['Em', 'D6/9'], techniques: ['Two-chord strumming'], tier: 'easy', targetMonth: 1, notes: '' },
  { title: 'Knockin’ on Heaven’s Door', artist: 'Bob Dylan', difficulty: 1, chords: ['G', 'D', 'Am', 'C'], techniques: ['Open chords', 'Strumming'], tier: 'easy', targetMonth: 1, notes: '' },
  { title: 'Bad Moon Rising', artist: 'Creedence Clearwater Revival', difficulty: 2, chords: ['D', 'A', 'G'], techniques: ['Strumming pattern'], tier: 'easy', targetMonth: 2, notes: '' },
  { title: 'Brown Eyed Girl', artist: 'Van Morrison', difficulty: 2, chords: ['G', 'C', 'D', 'Em'], techniques: ['Strumming pattern', 'Chord changes'], tier: 'easy', targetMonth: 2, notes: '' },
  { title: 'Seven Nation Army', artist: 'The White Stripes', difficulty: 1, chords: [], techniques: ['Single-note riff'], tier: 'easy', targetMonth: 3, notes: '' },
  { title: 'Smells Like Teen Spirit', artist: 'Nirvana', difficulty: 2, chords: ['F5', 'B♭5', 'A♭5', 'D♭5'], techniques: ['Power chords', 'Muted strums'], tier: 'easy', targetMonth: 3, notes: '' },
  { title: 'Creep', artist: 'Radiohead', difficulty: 3, chords: ['G', 'B', 'C', 'Cm'], techniques: ['Barre chords'], tier: 'stretch', targetMonth: 5, notes: '' },
  { title: 'Wish You Were Here (intro solo)', artist: 'Pink Floyd', difficulty: 3, chords: ['Em', 'G', 'A'], techniques: ['Bends', 'Hammer-ons', 'Solo'], tier: 'stretch', targetMonth: 6, notes: '' },
  { title: 'Sunshine of Your Love', artist: 'Cream', difficulty: 3, chords: ['D', 'C', 'A', 'G'], techniques: ['Riff', 'Pentatonic'], tier: 'stretch', targetMonth: 8, notes: '' },
]

export function seedSongs(now = Date.now()): Song[] {
  return SONGS.map((x, i) => ({
    ...x,
    id: `seed-song-${i + 1}`,
    status: 'queued',
    link: yt(`${x.title} ${x.artist}`),
    tags: ['placeholder'],
    order: i + 1,
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
    theme: 'dark',
    updatedAt: now,
  }
}
