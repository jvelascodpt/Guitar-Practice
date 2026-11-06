import { addDays, diffDays, type DateKey } from '../lib/dates'
import type { ReviewState, Song, SongStatus } from '../data/types'

/** Spaced-retrieval intervals for songs you can play: 2 days, 1 week, 2 weeks, 1 month. */
export const REVIEW_INTERVALS = [2, 7, 14, 30]

const playable = (s: SongStatus) => s === 'canPlay' || s === 'polished'

/** Fields to patch onto a song when its status changes. */
export function statusChangePatch(song: Song, next: SongStatus, today: DateKey): Partial<Song> {
  const patch: Partial<Song> = { status: next }
  if (next === 'learning' && song.status !== 'learning') {
    patch.learningSince = today
    patch.nudgeSnoozedUntil = undefined
  }
  if (playable(next) && !playable(song.status)) {
    patch.review = { stage: 0, due: addDays(today, REVIEW_INTERVALS[0]) }
  }
  if (!playable(next)) patch.review = undefined
  return patch
}

export type ReviewResult = 'solid' | 'shaky'

/**
 * Solid & on time → next interval. Solid but overdue (a missed review) → same
 * interval again, i.e. sooner than it would have been. Shaky → step back one.
 */
export function nextReview(review: ReviewState, result: ReviewResult, today: DateKey): ReviewState {
  const overdue = diffDays(review.due, today) > 0
  const last = REVIEW_INTERVALS.length - 1
  let stage = review.stage
  if (result === 'shaky') stage = Math.max(0, stage - 1)
  else if (!overdue) stage = Math.min(last, stage + 1)
  return { stage, due: addDays(today, REVIEW_INTERVALS[stage]), lastReviewed: today }
}

export function dueReviews(songs: Song[], today: DateKey): Song[] {
  return songs
    .filter((s) => playable(s.status) && s.review && s.review.due <= today)
    .sort((a, b) => a.review!.due.localeCompare(b.review!.due) || a.order - b.order)
}

/** Songs stuck in "learning" for 4+ weeks (and not snoozed). */
export function plateauedSongs(songs: Song[], today: DateKey): Song[] {
  return songs.filter(
    (s) =>
      s.status === 'learning' &&
      s.learningSince &&
      diffDays(s.learningSince, today) >= 28 &&
      !(s.nudgeSnoozedUntil && s.nudgeSnoozedUntil > today),
  )
}
