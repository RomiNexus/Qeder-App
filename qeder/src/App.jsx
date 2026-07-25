import { useState } from 'react'
import { Moon, Sparkles, BookHeart, Flame } from 'lucide-react'
import Questionnaire from './components/Questionnaire'
import ResultCard from './components/ResultCard'
import Journal from './components/Journal'
import { findMatch } from './utils/matcher'
import { recordCheckin, hasCheckedInToday, getStreak, addGratitudeEntry } from './utils/storage'

// Views the app can be in. Kept as a flat state machine — simple and
// predictable for a small, single-purpose PWA with no routing library.
const VIEWS = {
  HOME: 'home',
  CHECKIN: 'checkin',
  RESULT: 'result',
  JOURNAL: 'journal'
}

export default function App() {
  const [view, setView] = useState(VIEWS.HOME)
  const [result, setResult] = useState(null)

  function handleCheckinComplete(answers) {
    // Persist the gratitude note/tags to the local journal log.
    addGratitudeEntry(answers.gratitude)

    // Only grow the streak once per calendar day, even if the user redoes
    // the check-in later the same day.
    if (!hasCheckedInToday()) {
      recordCheckin()
    }

    const match = findMatch({
      emotion: answers.emotion,
      focus: answers.focus,
      need: answers.need,
      bandwidth: answers.bandwidth
    })

    setResult(match)
    setView(VIEWS.RESULT)
  }

  return (
    <>
      <div className="starfield" aria-hidden="true" />
      {view === VIEWS.HOME && (
        <Home
          onStartCheckin={() => setView(VIEWS.CHECKIN)}
          onViewJournal={() => setView(VIEWS.JOURNAL)}
        />
      )}
      {view === VIEWS.CHECKIN && (
        <Questionnaire onComplete={handleCheckinComplete} onExit={() => setView(VIEWS.HOME)} />
      )}
      {view === VIEWS.RESULT && result && (
        <ResultCard
          result={result}
          onRestart={() => setView(VIEWS.CHECKIN)}
          onViewJournal={() => setView(VIEWS.JOURNAL)}
        />
      )}
      {view === VIEWS.JOURNAL && (
        <Journal
          onBack={() => setView(result ? VIEWS.RESULT : VIEWS.HOME)}
          onStartCheckin={() => setView(VIEWS.CHECKIN)}
        />
      )}
    </>
  )
}

/**
 * Landing / welcome screen — the app's entry point each time it opens,
 * unless a result is already active in this session.
 */
function Home({ onStartCheckin, onViewJournal }) {
  const streak = getStreak()
  const checkedInToday = hasCheckedInToday()

  return (
    <div className="app-shell safe-top safe-bottom items-center justify-center px-6 text-center">
      <div className="animate-fade-in">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-sky/20 to-gold/10 shadow-glow">
          <Moon size={34} className="text-sky" />
        </div>

        <h1 className="mt-6 font-display text-3xl font-semibold text-slate-50">Qeder</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-400">
          A quiet moment to check in with your heart, and receive a Dua or verse chosen for
          exactly where you are today.
        </p>

        {streak > 0 && (
          <div className="mx-auto mt-5 flex w-fit items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1.5 text-sm font-medium text-gold">
            <Flame size={15} fill="currentColor" />
            {streak}-day streak
          </div>
        )}

        <button onClick={onStartCheckin} className="btn-primary mt-8 w-full">
          <Sparkles size={18} />
          {checkedInToday ? "Check In Again" : "Begin Today's Check-In"}
        </button>

        <button
          onClick={onViewJournal}
          className="btn-secondary mt-3 w-full"
        >
          <BookHeart size={18} />
          Open Journal
        </button>

        <p className="mt-8 text-xs text-slate-500">
          Everything stays on your device. No account, no tracking, no server.
        </p>
      </div>
    </div>
  )
}
