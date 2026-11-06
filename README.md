# Guitar Year

A local-first practice-consistency PWA for a one-year beginner electric guitar plan (Nov 2026 – Oct 2027).
Short daily sessions, zero decisions: open the app, press start.

Project context and requirements: [`docs/BRIEF.md`](docs/BRIEF.md).

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm test          # logic + storage unit tests
npm run build     # type-check + production build (with service worker)
npm run preview   # serve the build; install from the browser to get the home-screen app
```

On a phone, open the deployed URL and use "Add to Home Screen" (iOS) / "Install app" (Android).

## Layout

```
src/
  lib/dates.ts            local-calendar date keys (YYYY-MM-DD)
  data/                   types, Dexie schema + seed, repository, backup, sync seam
  logic/                  pure, unit-tested rules
    session.ts            builds today's session (interleaving, daily win, danger zones, pain easing, bad-day mode)
    streaks.ts            streaks with one free freeze per week
    reviews.ts            spaced retrieval for "can play" songs (2d / 1w / 2w / 1mo) + plateau detection
    pain.ts               2 sore days in a row → halve technique time for 3 days
  state/                  in-progress session timer (persisted), shared derived data
  audio/metronome.ts      Web Audio metronome + chime
  screens/                Today, Stats, Plan, Songs, More (recordings, settings, reminder, backup), Onboarding
```

## Data & sync

All data lives in IndexedDB (Dexie). Every record carries `updatedAt`, deletes leave tombstones in `deletions`,
and the UI only reads through live queries, so a remote sync (e.g. Supabase) can be added as an adapter
behind `src/data/sync.ts` without touching screens. Use **More → Backup** to export/import everything as JSON.

## Credits

Intro clip (`public/intro/shred.mp4`): ["FAST GUITAR SOLO"](https://commons.wikimedia.org/wiki/File:FAST_GUITAR_SOLO.webm)
by Guitinst72, licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), via Wikimedia Commons.
Trimmed to 3 seconds (from 0:47.8), cropped, re-encoded to H.264, audio removed.
