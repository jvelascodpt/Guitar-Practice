/**
 * How-to content for every warm-up and skill in the plan: short steps, an
 * optional tab/chord diagram, and a lesson link. Keys match the names in
 * seed.ts exactly (a test checks this).
 *
 * Lessons: hand-picked for the warm-ups and Nov–Jan (mostly JustinGuitar,
 * free). Later months fall back to a YouTube search until they're hand-picked.
 *
 * Chord shapes are written low E → high E, e.g. "x02210" (x = don't play).
 * Tabs are written high e on top, like standard tab.
 */
export interface Lesson {
  url: string
  label: string
}

export interface HowTo {
  steps: string[]
  tab?: string
  lesson?: Lesson
  /** YouTube search used for "more videos" (and as the lesson when none is hand-picked). */
  search?: string
}

const JG = (slug: string, label: string): Lesson => ({ url: `https://justinguitar.com/${slug}`, label: `JustinGuitar: ${label}` })

const L = {
  basics: JG('modules/before-you-begin-guitar-basics', 'Before you begin (tuning, pick)'),
  grips: JG('guitar-lessons/the-8-essential-beginner-chord-grips-b1-701', 'The 8 essential beginner chords'),
  anchor: JG('guitar-lessons/anchor-fingers-for-a-d-and-e-bc-114', 'Anchor fingers for A, D and E'),
  dChord: JG('guitar-lessons/the-d-chord-bc-111', 'The D chord'),
  oneMinute: JG('guitar-lessons/one-minute-changes-exercise-b1-110', 'One-minute changes'),
  gChord: JG('guitar-lessons/the-g-chord-hacked-b1-602', 'The G chord'),
  cChord: JG('guitar-lessons/the-c-chord-bc-132', 'The C chord'),
  allDown: JG('guitar-lessons/rhythm-essentials-rm-001', 'Rhythm essentials'),
  mechanics: JG('guitar-lessons/strumming-mechanics-b1-204', 'Strumming mechanics'),
  exploring: JG('guitar-lessons/exploring-strumming-b1-503', 'Exploring strumming (Old Faithful)'),
  backbeat: JG('guitar-lessons/the-backbeat-hit-bg-1405', 'The backbeat hit'),
  muting: JG('guitar-lessons/string-muting-techniques-im-134', 'String muting techniques'),
  spider: JG('guitar-lessons/the-spider-te-201', 'The Spider'),
  chromatic: { url: 'https://appliedguitartheory.com/lessons/4-chromatic-exercises-fingers-warmed-up/', label: 'Applied Guitar Theory: chromatic warm-ups' },
}

/** Builds a tab from [string, fret] pairs played in order (strings: e B G D A E). */
function tab(notes: [string, number | string][]): string {
  const order = ['e', 'B', 'G', 'D', 'A', 'E']
  const lines = order.map((n) => `${n}|-`)
  for (const [str, fret] of notes) {
    const f = String(fret)
    order.forEach((n, i) => (lines[i] += (n === str ? f : '-'.repeat(f.length)) + '-'))
  }
  return lines.map((l) => l + '|').join('\n')
}

const SKIP_BOX = tab([
  ['E', 5], ['E', 8], ['D', 5], ['D', 7], ['A', 5], ['A', 7], ['G', 5], ['G', 7],
  ['D', 5], ['D', 7], ['B', 5], ['B', 8], ['G', 5], ['G', 7], ['e', 5], ['e', 8],
])

const PENT_BOX = `e|-----------------------5-8-|
B|-------------------5-8-----|
G|---------------5-7---------|
D|-----------5-7-------------|
A|-------5-7-----------------|
E|-5-8-----------------------|`

export const HOWTO: Record<string, HowTo> = {
  // ---------------- warm-ups ----------------
  'Gentle hand & forearm warm-up': {
    steps: [
      'Open and close both hands slowly, 10 times.',
      'Easy wrist circles each way, then gently shake out your hands.',
      'Nothing should hurt. If it does, stop and make today a 5-minute day.',
    ],
  },
  'Chromatic 1-2-3-4 on low E & A': {
    steps: [
      'Low E string (thickest): index on fret 1, middle on 2, ring on 3, pinky on 4. One note per click.',
      'Do the same on the A string, then come back down 4-3-2-1.',
      'Thumb behind the neck, light pressure, fingers close to the strings.',
    ],
    tab: `A|-----------1-2-3-4-4-3-2-1---------|
E|-1-2-3-4-------------------4-3-2-1-|`,
    lesson: L.chromatic,
    search: 'chromatic 1234 guitar exercise beginner',
  },
  'Open-string picking, slow and even': {
    steps: [
      'Pick each open string 4 times, low E to high e and back, one note per click.',
      'Make every note the same volume. Even beats fast.',
      'Small pick movements; rest your palm lightly near the bridge if it helps.',
    ],
    tab: `e|-------------------------0-0-0-0-|
B|---------------------0-0-0-0-----|
G|---------------0-0-0-0-----------|
D|---------0-0-0-0-----------------|
A|---0-0-0-0-----------------------|
E|-0-0-0-0-------------------------|`,
    search: 'open string picking exercise beginner guitar',
  },
  'Chord-shape squeeze & release (light grip)': {
    steps: [
      'Form a chord you know (Em or A), press just enough for it to ring, then relax without lifting off.',
      'Repeat: press 2 s, release 2 s. Find the least pressure that still sounds clean.',
      'Lift the whole shape off, then land it again all at once.',
    ],
    search: 'guitar chord pressure exercise light grip beginner',
  },
  'Spider exercise across 3 strings': {
    steps: [
      'One finger per fret, frets 1–4, zig-zagging between two strings: 1 on E, 2 on A, 3 on E, 4 on A.',
      'Then shift over a string (A and D) and repeat.',
      'Slow and clean. It trains finger independence, not speed.',
    ],
    tab: tab([['E', 1], ['A', 2], ['E', 3], ['A', 4], ['A', 1], ['D', 2], ['A', 3], ['D', 4]]),
    lesson: L.spider,
    search: 'spider exercise guitar beginner',
  },
  'Palm-muted open strings': {
    steps: [
      'Rest the side of your picking hand on the strings right where they meet the bridge.',
      'Pick the low E in steady 8ths: you want a tight "chug", not a dead thud.',
      'Too muffled? Slide your hand back toward the bridge. Ringing? Slide it forward.',
    ],
    tab: `E|-0-0-0-0-0-0-0-0-|
  PM--------------`,
    search: 'palm muting guitar beginner lesson',
  },
  'Pentatonic box up & down, slow': {
    steps: ['A minor pentatonic at the 5th fret: up from low E to high e, then back down.', 'Index finger covers fret 5; ring or pinky covers 7 and 8.', 'One note per click. Say the fret numbers out loud.'],
    tab: PENT_BOX,
    search: 'A minor pentatonic scale position 1 beginner',
  },
  'Hammer-on / pull-off trills': {
    steps: [
      'G string: fret 5 with index. Pick once, then hammer the ring finger onto fret 7.',
      'Pull the ring finger off with a little downward flick so fret 5 rings again.',
      'Keep going without picking again: 5-7-5-7. Then try other strings.',
    ],
    tab: `G|-5h7p5h7p5h7p5-|`,
    search: 'hammer on pull off trill exercise guitar beginner',
  },
  'String skipping on the box': {
    steps: ['Play the pentatonic box but skip a string each time: E then D, A then G, D then B, G then e.', 'Keep the picking hand relaxed; it has to jump.', 'Slow first. Accuracy, then speed.'],
    tab: SKIP_BOX,
    search: 'string skipping pentatonic exercise guitar',
  },

  // ---------------- Nov: setup & first chords ----------------
  'Tuning + pick grip': {
    steps: [
      'Tune with a free tuner app: E A D G B E, thickest to thinnest. Tune up to each note, not down.',
      'Pick: rest it on the side of your index finger, thumb flat on top, just the tip showing.',
      'Hold it loosely: firm at the fingertips, relaxed wrist and forearm.',
    ],
    lesson: L.basics,
    search: 'how to tune guitar and hold a pick beginner',
  },
  'Clean single notes': {
    steps: [
      'Press just behind the fret (not on top of it), with the tip of your finger.',
      'Pick each open string 4 times, then frets 1–3 on the low E.',
      'Buzz? Press a little closer to the fret, not harder.',
    ],
    tab: `E|-0-0-1-1-2-2-3-3-|`,
    search: 'how to play clean notes guitar beginner fretting',
  },
  'Em ↔ Am changes': {
    steps: [
      'Em = 022000: middle and ring on fret 2 of the A and D strings.',
      'Am = x02210: index on B1, middle on D2, ring on G2. Don’t strum the low E.',
      'Change between them: lift all fingers together and land them together. 4 strums each.',
    ],
    tab: `Em: 022000   Am: x02210`,
    lesson: L.grips,
    search: 'E minor to A minor chord change beginner',
  },
  'E ↔ A changes': {
    steps: [
      'E = 022100: index on G1, middle on A2, ring on D2.',
      'A = x02220: three fingers in a row on fret 2 of the D, G and B strings.',
      'Keep fingers hovering close to the strings between shapes.',
    ],
    tab: `E: 022100   A: x02220`,
    lesson: L.anchor,
    search: 'E to A chord change beginner guitar',
  },
  'A ↔ D changes': {
    steps: [
      'D = xx0232: index on G2, middle on high e2, ring on B3. Strum only the top 4 strings.',
      'From A, move as a unit to D. Your index stays near fret 2 (an anchor).',
      '4 strums each, slowly. Clean beats quick.',
    ],
    tab: `A: x02220   D: xx0232`,
    lesson: L.dChord,
    search: 'A to D chord change beginner guitar',
  },
  'Timed 1-minute changes': {
    steps: [
      'Pick two chords (e.g. A and D). Set a 60-second timer.',
      'Strum once per chord, switching back and forth. Count every change.',
      'Write the number in the month’s notes. Beat it next time; 60 a minute is the goal.',
    ],
    lesson: L.oneMinute,
    search: 'one minute changes guitar exercise',
  },

  // ---------------- Dec: open chord vocabulary ----------------
  'G shape': {
    steps: [
      'G = 320003: middle on low E3, index on A2, ring on high e3 (or 320033 with your pinky on B3).',
      'Strum all 6 strings, then pick string by string. Every one should ring.',
      'Arch your fingers so they don’t touch the open strings.',
    ],
    tab: `G: 320003`,
    lesson: L.gChord,
    search: 'G chord beginner guitar lesson',
  },
  'C shape': {
    steps: [
      'C = x32010: ring on A3, middle on D2, index on B1. Don’t play the low E.',
      'Arch the ring finger so the G string rings open.',
      'Check one string at a time and fix whichever one is muted.',
    ],
    tab: `C: x32010`,
    lesson: L.cChord,
    search: 'C chord beginner guitar lesson',
  },
  'Dm shape': {
    steps: [
      'Dm = xx0231: middle on G2, ring (or pinky) on B3, index on high e1.',
      'Strum only the top 4 strings.',
      'It sounds sadder than D. That’s the minor sound.',
    ],
    tab: `Dm: xx0231`,
    search: 'JustinGuitar D minor chord',
  },
  'G ↔ C changes': {
    steps: [
      'G = 320003 → C = x32010. Ring and middle fingers each move down one string.',
      'Move all fingers together; land C before you strum.',
      '4 strums each at 60 bpm, then try 2 strums each.',
    ],
    tab: `G: 320003   C: x32010`,
    lesson: L.oneMinute,
    search: 'G to C chord change guitar beginner',
  },
  'Downstrokes on the beat': {
    steps: [
      'Metronome on. One down-strum exactly on each click.',
      'The strumming motion comes from a relaxed wrist and forearm, not the shoulder.',
      'Keep your hand moving even when you change chords. Late is better than stopping.',
    ],
    lesson: L.allDown,
    search: 'all down strums on the beat guitar beginner metronome',
  },
  'D ↔ G and C ↔ Am changes': {
    steps: [
      'D (xx0232) ↔ G (320003): 1 minute.',
      'C (x32010) ↔ Am (x02210): only the ring finger moves, from A3 to G2. 1 minute.',
      'Count the changes in each minute and note them.',
    ],
    tab: `D: xx0232  G: 320003  C: x32010  Am: x02210`,
    lesson: L.oneMinute,
    search: 'C to Am chord change guitar beginner',
  },

  // ---------------- Jan: rhythm & strumming ----------------
  'Counting 8ths: 1 & 2 &': {
    steps: [
      'Count out loud with the metronome: "1 & 2 & 3 & 4 &". Numbers land on the clicks.',
      'Strum down on the numbers, up on the "&"s.',
      'Keep your hand moving down-up all the time, even when you don’t hit the strings.',
    ],
    tab: `count: 1 & 2 & 3 & 4 &
strum: D U D U D U D U`,
    lesson: L.mechanics,
    search: 'counting eighth notes strumming guitar beginner',
  },
  'Down-up 8th-note strumming': {
    steps: [
      'One chord (G or Em). Down on each click, up halfway between.',
      'Up-strums only need the top 3–4 strings.',
      'Loose pick grip, relaxed wrist. Speed comes later.',
    ],
    lesson: L.mechanics,
    search: 'down up strumming eighth notes beginner guitar',
  },
  'Pattern D-D-U-U-D-U': {
    steps: [
      'Keep the down-up hand motion going, but skip the down-strum on beat 3.',
      'Strum: 1 (D), 2 (D), & (U), skip 3, & (U), 4 (D), & (U).',
      'Say it out loud: "down, down-up, -up, down-up". JustinGuitar calls this “Old Faithful 2”.',
    ],
    tab: `count: 1 & 2 & 3 & 4 &
strum: D   D U   U D U`,
    lesson: L.exploring,
    search: 'D DU UDU strumming pattern beginner guitar',
  },
  'Fretting-hand muting (chucks)': {
    steps: [
      'Hold a chord. On the "chuck", relax your fretting fingers so they still touch the strings but don’t press.',
      'Strum: you should hear a dry "chk" instead of a chord, like a snare drum.',
      'Try: strum on beats 1 and 3, chuck on beats 2 and 4.',
    ],
    tab: `count: 1   2   3   4
strum: D  chk  D  chk`,
    lesson: L.backbeat,
    search: 'guitar strumming chuck percussive mute beginner',
  },
  'Chord changes at 80 bpm': {
    steps: [
      'Metronome at 80. Two bars (8 strums) on each chord, then one bar each.',
      'Pairs: G↔C, D↔G, Am↔C, Em↔G.',
      'If you miss the change, keep strumming. Your hand never stops.',
    ],
    lesson: L.oneMinute,
    search: 'chord change practice with metronome beginner guitar',
  },
  'Finger independence: 1-2-3-4 spider': {
    steps: [
      'One finger per fret, frets 1–4: play 1-2-3-4 on the low E, then on the A, D, G, B and high e strings.',
      'Leave each finger down until the next string. Thumb behind the neck.',
      'Then try 1-3-2-4. Slow and clean.',
    ],
    tab: `e|-------------------------------1-2-3-4-|
B|-------------------------1-2-3-4-------|
G|-----------------1-2-3-4---------------|
D|---------1-2-3-4-----------------------|
A|-1-2-3-4-------------------------------|`,
    lesson: L.spider,
    search: 'spider exercise guitar finger independence',
  },

  // ---------------- Feb: power chords & palm muting ----------------
  'Root-6 power chords': {
    steps: ['Index on the low E string, ring on the A string two frets higher. Play only those 2 strings.', 'G5 = 3-5 on E-A. Move the shape to fret 5 for A5.', 'Let your index lightly touch the higher strings to mute them.'],
    tab: `G5     A5
A|-5-  A|-7-
E|-3-  E|-5-`,
    search: 'root 6 power chords beginner guitar lesson',
  },
  'Root-5 power chords': {
    steps: ['Same shape, one string over: index on the A string, ring on the D string two frets higher.', 'C5 = A3 + D5. D5 = A5 + D7.', 'Rest your index tip against the low E to mute it.'],
    tab: `C5     D5
D|-5-  D|-7-
A|-3-  A|-5-`,
    search: 'root 5 power chords beginner guitar lesson',
  },
  'Sliding power chords': {
    steps: ['Play G5 (low E3 + A5) and slide the shape up to A5 (frets 5-7) without lifting.', 'Keep light pressure while sliding, firm on arrival.', 'Then slide back down. Pick once, let the slide do the rest.'],
    tab: `A|-5/7-7\\5-|
E|-3/5-5\\3-|`,
    search: 'sliding power chords guitar beginner',
  },
  'Palm muting with gain': {
    steps: ['Add some distortion on your amp or app.', 'Rest the side of your picking hand on the strings at the bridge; play power chords in 8ths.', 'Try 4 muted strums then 4 open ones. Hear the difference.'],
    search: 'palm muting power chords distortion beginner',
  },
  'Riff #1: slow → tempo': {
    steps: ['Pick a riff from your song list (Animals or Uptown Funk this month).', 'Learn 2 notes at a time; loop each bit 5 times.', 'Metronome at half speed, then add 5 bpm when it’s clean 3 times in a row.'],
    search: 'easy guitar riffs for beginners lesson',
  },
  'Riff #2: slow → tempo': {
    steps: ['Second riff: same method. Small pieces, slow loops, then join them.', 'Only speed up when it’s clean 3 times in a row.', 'End by playing riff #1 then riff #2 back to back.'],
    search: 'easy rock guitar riffs beginner lesson',
  },

  // ---------------- Mar: minor pentatonic ----------------
  'A minor pentatonic box (5th fret)': {
    steps: ['Two notes per string: 5-8 on the E strings and B, 5-7 on A, D and G.', 'Index stays at fret 5; ring for 7, pinky for 8.', 'Up and down, one note per click, until you can do it without looking.'],
    tab: PENT_BOX,
    search: 'A minor pentatonic scale position 1 beginner lesson',
  },
  'Alternate picking on the box': {
    steps: ['Strict down-up-down-up picking, even when you change strings.', 'Start at 70 bpm, one note per click; then two notes per click.', 'Small pick movements, wrist relaxed.'],
    tab: PENT_BOX,
    search: 'alternate picking pentatonic beginner guitar',
  },
  'First bends (G string, half step)': {
    steps: ['Fret 8 on the G string and listen: that’s your target.', 'Now play fret 7 and push the string up toward the ceiling until it matches fret 8.', 'Use two or three fingers together on the string for strength.'],
    tab: `G|-8---7b8-| (play 8 to hear the target, then bend 7 up to it)`,
    search: 'how to bend guitar strings beginner half step',
  },
  'Licks over an A minor backing track': {
    steps: ['Find an "A minor jam track" on YouTube and play along.', 'Use only 3–4 notes of the box at first; leave space between phrases.', 'End phrases on an A (low E5, D7, or high e5).'],
    search: 'A minor backing track slow',
  },
  'Scale at 100 bpm 8ths': {
    steps: ['The box, two notes per click, alternate picking.', 'Today’s tempo is on the metronome. It climbs a little each day.', 'Clean and relaxed first; if it gets tense, drop 5 bpm.'],
    tab: PENT_BOX,
    search: 'pentatonic speed practice metronome beginner',
  },
  'Write a 4-bar solo': {
    steps: ['Over the A minor backing track, make up a 4-bar phrase using the box.', 'Include one bend and end on an A.', 'Play it the same way 3 times so it’s "written". Record it.'],
    search: 'how to write a simple guitar solo beginner pentatonic',
  },

  // ---------------- Apr: barre chords ----------------
  'Mini-F (top 4 strings)': {
    steps: ['F = xx3211: index flat across the B and high e at fret 1, middle on G2, ring on D3.', 'Strum only the top 4 strings.', 'Roll the index slightly onto its bony side; that takes less pressure.'],
    tab: `mini F: xx3211`,
    search: 'easy F chord mini F beginner guitar',
  },
  'Full F barre: press, check, release': {
    steps: ['F = 133211: index across all strings at fret 1, then the E-shape with the other fingers.', '30 s on (press, pick each string, adjust), 30 s off. Repeat a few times only.', 'Use arm weight pulling back, not a thumb squeeze. Stop if your hand aches.'],
    tab: `F: 133211`,
    search: 'F barre chord beginner lesson',
  },
  'B-shape (A-shape barre)': {
    steps: ['B = x24442: index barres from the A string at fret 2, ring (or three fingers) on fret 4 of D, G, B.', 'Don’t play the low E.', 'Same shape at fret 1 is B♭ (x13331).'],
    tab: `B: x24442   B♭: x13331`,
    search: 'B barre chord A shape beginner guitar',
  },
  'F ↔ C changes': {
    steps: ['C (x32010) ↔ F (mini xx3211 or full 133211).', 'Slow, 4 strums each at 60 bpm.', 'Keep the session short today; strength builds between sessions.'],
    tab: `C: x32010   F: xx3211 / 133211`,
    search: 'F to C chord change guitar',
  },
  'Transpose a known song with barres': {
    steps: ['Take a song you know with open chords (e.g. Heroes: Am G C).', 'Play it with barre versions: Am = 577555, G = 355433, C = x35553.', 'Same song, new sound, and real-world barre practice.'],
    search: 'how to use barre chords to play songs beginner',
  },
  'F check: clean rings out of 10': {
    steps: ['Play the F barre 10 times: form it, strum, pick each string.', 'Count how many times every string rings clean.', 'Note the score. The month’s goal is 8 out of 10.'],
    tab: `F: 133211`,
    search: 'F barre chord tips buzzing strings',
  },

  // ---------------- May: expression ----------------
  'Vibrato on held notes': {
    steps: ['Play a note (e.g. B string fret 8) and rock the string slightly up and back, steadily.', 'Movement comes from the wrist, like turning a doorknob.', 'Slow, wide vibrato first; then faster and narrower.'],
    search: 'guitar vibrato technique beginner',
  },
  'In-tune bends': {
    steps: ['Fret the target note first (e.g. G string fret 9) and listen.', 'Play fret 7 and bend up a whole step until it matches fret 9.', 'Check it against the target every time. In tune matters more than wide.'],
    tab: `G|-9---7b9-|`,
    search: 'how to bend in tune guitar whole step',
  },
  'Hammer-ons & pull-offs': {
    steps: ['Hammer: pick fret 5, then slam a finger onto fret 7 so it sounds without picking.', 'Pull-off: from 7, flick the finger off sideways so fret 5 rings.', 'Try it on each string of the pentatonic box.'],
    tab: `G|-5h7-7p5-|`,
    search: 'hammer ons and pull offs beginner guitar lesson',
  },
  'Solo: phrase 1': {
    steps: ['Open your solo song (Gravity) and learn just the first phrase, 2–4 notes at a time.', 'Use a slowed-down video or the app’s 75% speed.', 'Loop it until it’s automatic, then stop. One phrase is today’s job.'],
    search: 'John Mayer Gravity solo lesson',
  },
  'Solo: phrase 2': {
    steps: ['Learn the next phrase the same way: small pieces, slow loops.', 'Then join phrase 1 + 2.', 'Bends and vibrato matter more than speed in this solo.'],
    search: 'John Mayer Gravity solo lesson',
  },
  'Solo phrases joined at 75%': {
    steps: ['Play all the phrases you know in order at 75% speed.', 'If one bit breaks down, loop just that bit 5 times, then go again.', 'Record a take at the end of the week to hear the progress.'],
    search: 'John Mayer Gravity solo slow lesson',
  },

  // ---------------- Jun: connecting the neck ----------------
  'Pentatonic position 2': {
    steps: ['Starts where box 1 ends: frets 7–10.', 'Same 5 notes (A C D E G) in a new place.', 'Up and down slowly; notice where the A notes are.'],
    tab: `e|-----------------------8-10-|
B|------------------8-10------|
G|--------------7-9-----------|
D|--------7-10----------------|
A|---7-10---------------------|
E|-8-10-----------------------|`,
    search: 'A minor pentatonic position 2 guitar',
  },
  'Pentatonic position 3': {
    steps: ['Frets 9–13: the next box up the neck.', 'Up and down slowly, then connect it to position 2.', 'Find every A in the shape.'],
    tab: `e|-------------------------10-12-|
B|--------------------10-13------|
G|----------------9-12-----------|
D|----------10-12----------------|
A|----10-12----------------------|
E|-10-12-------------------------|`,
    search: 'A minor pentatonic position 3 guitar',
  },
  'Shifting between positions 1–3': {
    steps: ['Play up box 1, slide up on the G string into box 2, finish there.', 'Then box 2 → box 3 the same way.', 'Slides make the shifts smooth. Keep it slow.'],
    search: 'connecting pentatonic positions slide guitar',
  },
  '12-bar blues in A: shuffle rhythm': {
    steps: ['Bars: A A A A | D D A A | E D A E.', 'On each chord, rock between the 5th and 6th: A5 (x02xxx) ↔ A6 (x04xxx), same for D and E.', 'Count "1-and 2-and" with a lazy, swung feel.'],
    tab: `A shuffle:
D|-2-2-4-4-2-2-4-4-|
A|-0-0-0-0-0-0-0-0-|`,
    search: '12 bar blues shuffle in A beginner guitar',
  },
  'Shuffle feel: swung 8ths': {
    steps: ['Swung 8ths: the first note of each pair is long, the second short ("DAA-da DAA-da").', 'Play muted strums along with a shuffle backing track.', 'Then add the A5/A6 shuffle on top.'],
    search: 'shuffle swing feel guitar beginner lesson',
  },
  'Improvise over a 12-bar backing track': {
    steps: ['A blues backing track + A minor pentatonic box 1.', 'Play short phrases and leave gaps; land on A when the progression returns to A.', 'Goal: 12 bars without stopping, even if it’s simple.'],
    search: '12 bar blues backing track A slow',
  },

  // ---------------- Jul: ear training & songs ----------------
  'Find the first note by ear': {
    steps: ['Play the song, pause on the first note, hum it.', 'Search one string (the B or G) for the matching note, fret by fret.', 'Found it? The next notes are usually close by.'],
    search: 'how to learn songs by ear guitar beginner',
  },
  'Riff #1 by ear': {
    steps: ['Pick a short riff from your by-ear songs (Where You Are or Food for the Soul).', 'Find each note by humming and searching one string.', 'Write it down as tab so you don’t lose it.'],
    search: 'learn riffs by ear guitar tips',
  },
  'Riff #2 by ear': {
    steps: ['Same method on a second riff.', 'Slow the song down (YouTube playback speed 0.75) if it helps.', 'Check it against the recording at full speed.'],
    search: 'learn riffs by ear guitar tips',
  },
  'Riff #3 by ear': {
    steps: ['Third riff. Notice which notes keep coming up.', 'Do they fit the minor pentatonic box? Most do.', 'Write it down and add it to the song notes.'],
    search: 'learn riffs by ear guitar tips',
  },
  'Full song: rhythm part': {
    steps: ['Play the song’s chords start to finish with the recording.', 'Don’t stop for mistakes; jump back in on the next chord.', 'Mark the bars that keep breaking down and loop those.'],
    search: 'how to practice a full song guitar beginner',
  },
  'Full song: lead part': {
    steps: ['Learn the song’s riff or lead line in sections.', 'Alternate days: rhythm part one day, lead the next.', 'Finish with a full play-through of either part.'],
    search: 'how to practice a full song guitar beginner',
  },

  // ---------------- Aug: technique push ----------------
  'Pentatonic speed ladder': {
    steps: ['The box in 8ths at today’s tempo (it goes up 2 bpm each practice day).', 'Clean 3 times in a row = done for today. Not clean? Stay at this tempo tomorrow.', 'Tension creeping in? Drop 10 bpm and reset.'],
    tab: PENT_BOX,
    search: 'pentatonic speed building metronome guitar',
  },
  'String skipping': {
    steps: ['Pentatonic box skipping one string: E→D, A→G, D→B, G→e.', 'Slow; aim the pick precisely.', 'Then try the pattern descending.'],
    tab: SKIP_BOX,
    search: 'string skipping exercise guitar',
  },
  'Major & minor arpeggios': {
    steps: ['Arpeggio = a chord’s notes one at a time.', 'Hold C (x32010) and pick A, D, G, B, e strings separately, then Am (x02210) the same way.', 'Then try moving shapes: C major and A minor up the neck.'],
    search: 'beginner guitar arpeggios major minor',
  },
  'Major scale (one position)': {
    steps: ['G major, 2nd-position shape, starting on the low E 3rd fret.', 'Up and down slowly. Sing "do re mi" as you play.', 'Every G in the shape is home.'],
    tab: `e|-------------------------2-3-|
B|---------------------3-5-----|
G|---------------2-4-5---------|
D|---------2-4-5---------------|
A|---2-3-5---------------------|
E|-3-5-------------------------|`,
    search: 'G major scale one position guitar beginner',
  },
  'CAGED: C and A shapes': {
    steps: ['C chord open (x32010) uses the "C shape".', 'The same C chord as an A-shape barre at fret 3: x35553.', 'Switch between them; same chord, two places on the neck.'],
    tab: `C (C shape): x32010   C (A shape): x35553`,
    search: 'CAGED system beginner explained',
  },
  'CAGED: G, E and D shapes': {
    steps: ['The rest of the C chords: G shape (8-7-5-5-5-8), E shape (8-10-10-9-8-8), D shape (x x 10-12-13-12).', 'Play C in all five shapes, moving up the neck.', 'Notice how each shape links to the next.'],
    tab: `C (G shape): 875558
C (E shape): 8 10 10 9 8 8
C (D shape): x x 10 12 13 12`,
    search: 'CAGED chord shapes C chord all positions',
  },

  // ---------------- Sep: tone & gear ----------------
  'Gain staging: find the edge of breakup': {
    steps: ['Start with gain at zero; strum a chord.', 'Turn gain up slowly until the sound just starts to crunch when you dig in.', 'Note that setting: clean when soft, gritty when hard.'],
    search: 'guitar amp gain edge of breakup explained',
  },
  'EQ sweep: bass / mid / treble': {
    steps: ['Set all EQ knobs to the middle.', 'Sweep one knob at a time all the way down and up while playing.', 'Note what each one does to your tone; settle on a favourite.'],
    search: 'guitar amp EQ explained beginner',
  },
  'Clean vs crunch on the same riff': {
    steps: ['Play one riff on a clean setting, then on crunch.', 'Notice what changes: sustain, attack, how mistakes sound.', 'Pick the tone that suits each song in your list.'],
    search: 'clean vs crunch guitar tone beginner',
  },
  'Try a pedal or amp-sim effect': {
    steps: ['Try one effect: overdrive, delay, chorus or reverb.', 'Play one song with it and one without.', 'Less is more: one effect at a time.'],
    search: 'guitar effects pedals explained beginner',
  },
  'Record over a backing track': {
    steps: ['Phone recorder + backing track, or an app that records both.', 'Play one take without stopping, whatever happens.', 'Listen back once; note one thing to improve.'],
    search: 'how to record guitar with phone backing track',
  },
  'Polish the 1-minute clip': {
    steps: ['Pick your best section for a 1-minute clip.', 'Fix the one weakest spot, then record 3 takes.', 'Keep the best one and add it to this month’s recording.'],
    search: 'tips recording guitar video clip',
  },

  // ---------------- Oct: perform & plan year 2 ----------------
  'Set-list run-through (3 songs)': {
    steps: ['Choose 3 songs you can play. Play them back to back without stopping.', 'Mistakes happen; keep going like it’s a gig.', 'Note which song needs the most work.'],
    search: 'how to practice a set list guitar',
  },
  'Solo at full speed': {
    steps: ['Your solo at 90%, then 100%.', 'If it breaks down at full speed, loop the hard phrase at 90%.', 'Record a full-speed take at the end of the week.'],
    search: 'how to get a guitar solo up to speed',
  },
  'Improvise over a new backing track': {
    steps: ['Pick a backing track in a key you haven’t used (try E minor or G major).', 'Find the root note first, then move your pentatonic box to it.', 'Play for the whole track.'],
    search: 'improvise guitar new key backing track beginner',
  },
  'Performance take: play it like it counts': {
    steps: ['Record one take of a song as if someone is listening.', 'No restarts.', 'Share it with someone, or keep it as this month’s clip.'],
    search: 'guitar performance anxiety tips beginner',
  },
  'Fix weak spots from the run-through': {
    steps: ['Pick the 2 bars that went worst in your run-through.', 'Loop them slowly, 10 times clean.', 'Then play the whole song again.'],
    search: 'how to fix mistakes in songs guitar practice',
  },
  'Try a year-2 direction': {
    steps: ['Spend this slot trying something new: fingerstyle, blues lead, a new genre.', 'Note what was most fun.', 'That’s your year-2 plan.'],
    search: 'what to learn after first year guitar',
  },
}

export const youtubeSearch = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`

export function howTo(name: string): HowTo | undefined {
  return HOWTO[name]
}
