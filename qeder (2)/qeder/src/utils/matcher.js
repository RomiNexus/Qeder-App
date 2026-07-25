import duas from '../data/duas.json'

/**
 * matcher.js
 * ----------
 * A fully client-side scoring engine. Given the user's 5 check-in answers,
 * it scores every entry in the local scripture database and returns the
 * best match — randomly selected from the top-scoring tier so the same
 * answers don't always produce the exact same result.
 *
 * Scoring weights (out of a possible 6 points per entry):
 *   +3  exact match on spiritual `need`      (the strongest signal — what they asked for)
 *   +2  exact match on `emotion`             (how their heart feels right now)
 *   +1  exact match on `focus`               (the area of life it's about)
 *   bandwidth is used as a soft filter, not a scoring point — see below.
 */

const WEIGHTS = {
  need: 3,
  emotion: 2,
  focus: 1
}

const RECENT_HISTORY_KEY = 'qeder_recent_result_ids'
const RECENT_HISTORY_LIMIT = 3 // avoid repeating the last 3 results shown

/**
 * Reads the list of recently-shown entry IDs from localStorage.
 * Used to reduce repetition across consecutive check-ins.
 */
function getRecentIds() {
  try {
    const raw = localStorage.getItem(RECENT_HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * Pushes a newly-shown entry ID onto the recent history, capped at
 * RECENT_HISTORY_LIMIT most-recent entries.
 */
function rememberShownId(id) {
  try {
    const recent = getRecentIds()
    const updated = [id, ...recent.filter((x) => x !== id)].slice(0, RECENT_HISTORY_LIMIT)
    localStorage.setItem(RECENT_HISTORY_KEY, JSON.stringify(updated))
  } catch {
    // localStorage may be unavailable (private browsing) — fail silently,
    // repetition-avoidance is a nice-to-have, not a requirement.
  }
}

/**
 * Scores a single database entry against the user's answers.
 * Returns an integer score. Higher = better match.
 */
function scoreEntry(entry, answers) {
  const { emotion, focus, need, bandwidth } = answers
  let score = 0

  if (need && entry.tags.need.includes(need)) score += WEIGHTS.need
  if (emotion && entry.tags.emotion.includes(emotion)) score += WEIGHTS.emotion
  if (focus && entry.tags.focus.includes(focus)) score += WEIGHTS.focus

  // Bandwidth is a soft preference boost rather than a hard filter — every
  // entry has a short, medium, and long way to be presented in the UI, but
  // we gently favor entries explicitly tagged for the requested capacity.
  if (bandwidth && entry.tags.bandwidth.includes(bandwidth)) score += 1

  return score
}

/**
 * Main entry point. Takes the user's 5 check-in answers and returns the
 * single best-matched scripture/dua entry.
 *
 * @param {Object} answers
 * @param {string} answers.emotion   - one of: peaceful | anxious | heavy | grateful | numb
 * @param {string} answers.focus     - one of: work | family | health | future | faith
 * @param {string} answers.need      - one of: patience | comfort | forgiveness | strength | guidance
 * @param {string} answers.bandwidth - one of: quick | dua | deep
 * @returns {Object} the matched entry from duas.json, plus its computed score
 */
export function findMatch(answers) {
  if (!answers) {
    throw new Error('findMatch requires an answers object')
  }

  const scored = duas.map((entry) => ({
    entry,
    score: scoreEntry(entry, answers)
  }))

  const maxScore = Math.max(...scored.map((s) => s.score))

  // Top tier = every entry that achieved the highest score for this answer set.
  let topTier = scored.filter((s) => s.score === maxScore)

  // Prefer entries not shown in the last few check-ins, if any alternative exists.
  const recentIds = getRecentIds()
  const unseenTopTier = topTier.filter((s) => !recentIds.includes(s.entry.id))
  if (unseenTopTier.length > 0) {
    topTier = unseenTopTier
  }

  const chosen = topTier[Math.floor(Math.random() * topTier.length)]
  rememberShownId(chosen.entry.id)

  return {
    ...chosen.entry,
    matchScore: chosen.score
  }
}

/**
 * Exposed for testing / debugging: returns the full scored list, sorted
 * highest-first, without mutating recent history.
 */
export function debugScoreAll(answers) {
  return duas
    .map((entry) => ({ entry, score: scoreEntry(entry, answers) }))
    .sort((a, b) => b.score - a.score)
}
