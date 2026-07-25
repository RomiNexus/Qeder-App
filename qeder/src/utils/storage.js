/**
 * storage.js
 * ----------
 * Thin wrapper around localStorage for everything Qeder persists on-device:
 *   - daily streak (consecutive days checked in)
 *   - bookmarked Duas/verses
 *   - gratitude log entries
 *
 * Nothing here ever leaves the device — there is no backend. All reads are
 * defensive (wrapped in try/catch) since localStorage can throw in private
 * browsing modes or when storage is full.
 */

const KEYS = {
  STREAK: 'qeder_streak',
  LAST_CHECKIN_DATE: 'qeder_last_checkin_date',
  BOOKMARKS: 'qeder_bookmarks',
  GRATITUDE_LOG: 'qeder_gratitude_log'
}

function todayKey(date = new Date()) {
  // Local calendar date, e.g. "2026-07-25" — avoids timezone drift from ISO/UTC
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function daysBetween(dateStrA, dateStrB) {
  const a = new Date(`${dateStrA}T00:00:00`)
  const b = new Date(`${dateStrB}T00:00:00`)
  return Math.round((b - a) / (1000 * 60 * 60 * 24))
}

function safeGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw !== null ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

/* ---------------------------- Streak tracking ---------------------------- */

export function getStreak() {
  return safeGet(KEYS.STREAK, 0)
}

export function getLastCheckinDate() {
  return safeGet(KEYS.LAST_CHECKIN_DATE, null)
}

/**
 * Call once per completed check-in. Increments the streak if the last
 * check-in was yesterday, keeps it the same if it was already today,
 * or resets to 1 if a day (or more) was missed.
 * Returns the updated streak count.
 */
export function recordCheckin(date = new Date()) {
  const today = todayKey(date)
  const lastDate = getLastCheckinDate()
  let streak = getStreak()

  if (lastDate === today) {
    // Already checked in today — no change.
    return streak
  }

  if (lastDate) {
    const gap = daysBetween(lastDate, today)
    streak = gap === 1 ? streak + 1 : 1
  } else {
    streak = 1
  }

  safeSet(KEYS.STREAK, streak)
  safeSet(KEYS.LAST_CHECKIN_DATE, today)
  return streak
}

/**
 * True if today's check-in has already been recorded (used to avoid
 * double-counting the streak if the user redoes the questionnaire).
 */
export function hasCheckedInToday(date = new Date()) {
  return getLastCheckinDate() === todayKey(date)
}

/* ------------------------------ Bookmarks -------------------------------- */

export function getBookmarks() {
  return safeGet(KEYS.BOOKMARKS, [])
}

export function isBookmarked(entryId) {
  return getBookmarks().some((b) => b.id === entryId)
}

/**
 * Adds an entry to bookmarks (stores the full entry + timestamp so the
 * Journal view can render it without depending on the live database order).
 */
export function addBookmark(entry) {
  const bookmarks = getBookmarks()
  if (bookmarks.some((b) => b.id === entry.id)) return bookmarks
  const updated = [{ ...entry, bookmarkedAt: new Date().toISOString() }, ...bookmarks]
  safeSet(KEYS.BOOKMARKS, updated)
  return updated
}

export function removeBookmark(entryId) {
  const updated = getBookmarks().filter((b) => b.id !== entryId)
  safeSet(KEYS.BOOKMARKS, updated)
  return updated
}

export function toggleBookmark(entry) {
  return isBookmarked(entry.id) ? removeBookmark(entry.id) : addBookmark(entry)
}

/* ---------------------------- Gratitude log ------------------------------ */

/**
 * Appends a gratitude log entry: the selected quick-toggle tags plus any
 * free-text note, timestamped to today.
 */
export function addGratitudeEntry({ tags = [], note = '' }, date = new Date()) {
  const log = safeGet(KEYS.GRATITUDE_LOG, [])
  const entry = {
    date: todayKey(date),
    tags,
    note: note.trim(),
    createdAt: new Date().toISOString()
  }
  const updated = [entry, ...log]
  safeSet(KEYS.GRATITUDE_LOG, updated)
  return updated
}

export function getGratitudeLog() {
  return safeGet(KEYS.GRATITUDE_LOG, [])
}
