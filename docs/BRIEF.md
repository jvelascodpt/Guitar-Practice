# PROJECT: Guitar Year — practice consistency PWA

> Saved project brief, used as context for future sessions. Edit it when the plan changes.

## Who I am
Beginner electric guitarist starting Nov 2026. Goal: practice ~25 min/day, 5–6 days/week for 12 months, learn 12–25 songs, and be able to improvise over a blues/pentatonic jam by Oct 2027. I'm a physical therapist, so I care about wrist/forearm load — the app should encourage short daily sessions, not marathons.

## Song preferences
Artists (given Nov 2026): Martin Garrix, John Summit, John Mayer, Bruno Mars, Justin Bieber, Alesso, Calvin Harris, it's murph.
Mostly EDM/dance-pop, plus John Mayer for the blues/solo side. Things to avoid: none given yet.

How the library uses them (14 songs, 10 easy / 4 stretch, ordered to the plan; see `SONGS` in `src/data/seed.ts`):
- EDM tracks have little or no real guitar, so they're played as their 4-chord loop plus the synth hook as a single-note riff. Loops are great early material; the July ear-training songs (John Summit, it's murph) have no tabs on purpose.
- John Mayer carries the stretch work: Gravity (rhythm in Jan, first solo in May) and Slow Dancing in a Burning Room (barre rhythm in Apr, C#m pentatonic solo in Jun).
- Songs with an F before April use Fmaj7 (x x 3 2 1 0) until barre month.
- Several community chord sheets disagree (Scared to Be Lonely, Locked Out of Heaven); those songs carry a "check against the recording" note.
- Goal is 15 songs by Oct, so there is room for one or more additions.

## Stack
React + Vite + TypeScript, Tailwind, Dexie (IndexedDB) for local-first data, vite-plugin-pwa for offline + home-screen install. Keep a clean data layer so a Supabase sync adapter can be added later without rewriting. Dark mode default, mobile-first, fast on a phone.

## Features
1. Today: a pre-built session checklist (5 min warm-up / 10 min skill of the month / 10 min songs), built-in timer + metronome, one tap to mark the day done.
2. Streaks & stats: current/longest streak, calendar heatmap, minutes/week, days practiced per month.
3. Plan: one card per month (below) with the focus, a measurable goal, and weekly checkboxes.
4. Song library: title, artist, difficulty 1–5, status (queued / learning / can play / polished), chords/techniques, link to tab/video, notes. Filter by status and difficulty.
5. Recordings log: one entry per month with a note and optional local audio file, to compare progress.
6. Backup: export/import all data as JSON.
7. Daily reminder via Web Notifications at a time I set (where supported).

## Retention design (evidence-based; build these in)
1. Zero-decision sessions: Today always shows a pre-built session. I never choose what to practice; I press start.
2. Minimum viable session: a 5-minute "bad day" mode that still counts for the streak. Streaks reward showing up, not minutes.
3. Consistency over intensity: cap sessions at 30 min by default with a gentle "that's enough for today." Weekly target = days practiced, not total minutes.
4. Interleaved practice: a new skill gets 3–5 min blocked time for its first 3 days, then rotates into 2–3 min slices mixed with other items.
5. Daily win: every session ends with 5 min of a song I can already play. Never end a session on a hard item.
6. Spaced retrieval: songs marked "can play" come back on a schedule (2 days, 1 week, 2 weeks, 1 month). Missed = reschedule sooner, no shame.
7. Danger-zone support: in months with known quit points (barre chords, first solo), auto-shorten technique blocks to 3–5 min and add an extra song slot.
8. Visible progress: monthly recording prompt + compare-to-last-month view; "songs I can play" count on the home screen.
9. Habit anchoring: onboarding asks for a trigger ("after coffee") and reminder time; reminder text references the anchor.
10. Streak repair: one free "streak freeze" per week so a missed day doesn't reset to zero.
11. Pain check: optional 1-tap "hand/forearm felt" rating after sessions; if sore 2 days in a row, halve technique time for 3 days.
12. Plateau nudge: if a song sits at "learning" for 4+ weeks, suggest dropping to rhythm-only or swapping it.

## 12-month plan (seeds the Plan cards)
- **Nov 2026 – Setup & first chords.** Tune, pick grip, clean single notes; Em Am E A D; timed chord-change drills. Goal: 3 chords changed cleanly at 60 bpm.
- **Dec – Open chord vocabulary.** Add G C Dm; downstroke strumming with metronome; first 2 songs. Goal: one song start to finish without stopping.
- **Jan 2027 – Rhythm & strumming.** Up/down patterns, muting, counting 8ths; finger-independence warm-ups. Goal: 5 songs in rotation, changes at 80 bpm.
- **Feb – Power chords & palm muting.** Root-5/root-6 shapes, sliding, palm muting with gain; 2 rock riffs. Goal: one riff clean at tempo.
- **Mar – Minor pentatonic position 1.** A minor box, alternate picking, play over backing track, first bends. Goal: scale clean at 100 bpm 8ths; first 4-bar solo.
- **Apr – Barre chords.** F and B shapes, short frequent reps to build strength safely; transpose a known song. Goal: F major rings clean 8/10 times.
- **May – Expression.** Vibrato, in-tune bends, hammer-ons/pull-offs; first solo note-for-note. Goal: the solo at 75% tempo.
- **Jun – Connecting the neck.** Pentatonic positions 2–3, shifting; 12-bar blues, shuffle feel. Goal: improvise 12 bars without stopping.
- **Jul – Ear training & songs.** 3 riffs by ear; 2 full songs with chords + lead. Goal: 10-song repertoire.
- **Aug – Technique push.** Metronome speed work (+2–3 bpm/day), string skipping, arpeggios; major scale/CAGED basics. Goal: pentatonic at 140 bpm 8ths.
- **Sep – Tone & gear.** Amp gain staging/EQ, clean vs crunch, try pedals; record with backing track and compare to Nov. Goal: a 1-minute clip I'm proud of.
- **Oct – Perform & plan year 2.** Play for someone or post a clip; choose next direction. Goal: 15 songs, one solo at full speed, confident improv.

Every month: record one clip, keep the song list current, and back off intensity for a few days if the fretting hand/forearm hurts.

## Working agreement
- Build order: scaffold → data model + PWA + seed → Today → Streaks → Plan → Songs → Recordings / Backup / Reminder.
- Ask before adding anything beyond this scope.

## Implementation notes (decisions made while building)
- Session builder introduces the month's skills one at a time (roughly every 3 practice days). A new skill gets a 4-min blocked slot (3 min in danger-zone months) for 3 practice days, then rotates into 2–3 min slices. In week 1 of the plan there's nothing older to interleave yet, so sessions run ~20 min.
- Danger zones: April (barre chords) and May (first solo). Technique drops 10 → 6 min, plus a 4-min extra song slot.
- Streak freeze is automatic: the first missed day in each Monday–Sunday week is covered. Today never breaks a streak.
- Spaced reviews: "Solid" on time → next interval; "Solid" but overdue → same interval again (sooner); "Shaky" → one step back.
- Pain check: Fine / Tight / Sore. Two "Sore" days in a row → technique halved for the next 3 days.
- Plateau nudge (4+ weeks in learning): rhythm-only, swap for the next queued song, or keep going (snoozes 2 weeks).
- Songs start automatically: the first queued song whose plan month has arrived shows up as "Start: …" in Today; finishing it moves it to learning (max 2 learning).
- Reminders: browsers can't schedule exact-time notifications without a push server, so the reminder fires while the app is open/alive, and catches up on open if you haven't practiced. One per day.
- Weekly checkpoint wording in the Plan cards was written to break each month's goal into 4 steps; edit freely.
