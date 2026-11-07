/**
 * What Sheen says. Pure function of app state → an ordered list of lines;
 * the first is shown, tapping Sheen cycles through the rest. Friendly, short,
 * never guilt-trippy.
 */
export interface SheenContext {
  hour: number
  doneToday: boolean
  sessionMinutes: number
  firstItem?: string
  anchor?: string
  weekMessage: string
  painEaseUntil?: string | null
  dangerTitle?: string
  newSkill?: string
  startSong?: string
  reviewSong?: string
  plateauSong?: string
  recordPrompt: boolean
  look: string
}

const TIPS = [
  'Light fingers, clean notes. Press just behind the fret, not on it.',
  'Slow is smooth, smooth is fast. Half speed is a pro move.',
  'Short and daily beats long and rare. Every. Single. Time.',
  'Tap the ⓘ on any exercise and I’ll show you how it goes.',
  'Hit ▶ Hear chords on a song and I’ll play it for you.',
  'Thumb behind the neck, wrist relaxed. Tension is the enemy.',
]

export function sheenLines(c: SheenContext): string[] {
  const hi = c.hour < 12 ? 'Morning!' : c.hour < 18 ? 'Hey!' : 'Evening!'
  const lines: string[] = []

  if (c.doneToday) {
    lines.push(`${hi} Session done. That’s how legends are built. Rest those hands, see you tomorrow.`)
  } else {
    const first = c.firstItem ? ` First up: ${c.firstItem}.` : ''
    const cue = c.anchor ? ` (${c.anchor} is your cue!)` : ''
    lines.push(`${hi} I’m Sheen. Today’s set is ${c.sessionMinutes} minutes.${first} Hit Start when you’re ready${cue}`)
  }
  if (c.painEaseUntil) lines.push(`Your hand’s been sore, so I’ve halved technique time for a few days. Easy does it, those tendons matter.`)
  if (c.startSong && !c.doneToday) lines.push(`Your first song is up: ${c.startSong}! Play it at half speed. Clean beats fast every time. 🤘`)
  if (c.newSkill && !c.doneToday) lines.push(`New skill on deck: ${c.newSkill}. Tap the ⓘ next to it and I’ll walk you through it.`)
  lines.push(c.weekMessage)
  if (c.dangerTitle) lines.push(`${c.dangerTitle} is a tough month for everyone. Short reps, extra song time. We’ve got this.`)
  if (c.reviewSong) lines.push(`${c.reviewSong} is due for a review today. Play it from memory, then tell me if it was solid or shaky.`)
  if (c.plateauSong) lines.push(`${c.plateauSong} has been tricky for a while. Want to try just the rhythm part, or swap it? Check Songs.`)
  if (c.recordPrompt) lines.push('Record your monthly clip this week (More tab). Future-you will love hearing how far you’ve come.')
  lines.push(`Today’s fit: ${c.look}. 😎`)
  lines.push(...TIPS)
  return lines
}
