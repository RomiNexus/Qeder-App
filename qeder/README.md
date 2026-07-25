# Qeder

A mobile-first, offline-first Progressive Web App that asks a 5-question daily
spiritual check-in and uses a client-side scoring algorithm to serve a
personalized Dua or Qur'anic verse. **100% client-side — no backend, no
server costs, no account.**

## Tech stack

- **React 18 + Vite** — fast dev server, tiny production build
- **Tailwind CSS** — night-sky palette (`night` slate, `sky` blue, `gold` accent)
- **lucide-react** — icon set
- **vite-plugin-pwa** — offline caching, installable manifest, home-screen icons
- **localStorage** — streaks, gratitude log, bookmarks (no cookies, no cloud)

## Getting started

```bash
npm install
npm run dev       # local dev server at http://localhost:5173
npm run build     # production build -> dist/
npm run preview   # preview the production build locally
```

## Project structure

```
src/
  data/duas.json          6 tagged Quran verses / Hisnul Muslim duas
  utils/matcher.js         client-side scoring/matching engine
  utils/storage.js         localStorage helpers (streak, bookmarks, gratitude)
  components/
    Questionnaire.jsx      5-step check-in wizard with progress bar
    ResultCard.jsx          3-pillar result: Arabic / translation / context + audio
    Journal.jsx              streak + saved Duas view
  App.jsx                  view state machine: Home -> Check-in -> Result -> Journal
  main.jsx                  React root
public/
  icons/                    PWA icons (192, 512, maskable-512)
  favicon.svg, favicon.ico, apple-touch-icon.png
```

## How matching works

Each of the 6 database entries is tagged along four axes: `emotion`, `focus`,
`need`, and `bandwidth`. `findMatch()` in `src/utils/matcher.js` scores every
entry against the user's answers (need: +3, emotion: +2, focus: +1, bandwidth:
+1 soft boost), takes the highest-scoring tier, filters out anything shown in
the last 3 check-ins when possible, and picks randomly within what's left —
so repeat check-ins don't feel robotic.

## Content

The 6 seed entries mix Qur'anic ayat and Prophetic duas from **Hisnul
Muslim** (citing Sahih al-Bukhari references), each with Arabic script,
transliteration, English translation, historical/spiritual context, and an
audio recitation URL from `cdn.islamic.network` (Mishary Rashid Alafasy).
Swap in more entries by following the same shape in `src/data/duas.json` —
the matcher and UI both scale automatically with the database size.

## Before shipping to production

- Replace the placeholder icons in `public/icons/` (generated
  programmatically) with final branded artwork.
- Expand `src/data/duas.json` beyond the 6 seed entries for more variety.
- Double-check every Arabic text, transliteration, and citation against a
  trusted Islamic source before publishing — this seed set has been
  carefully sourced, but always verify religious content yourself.
