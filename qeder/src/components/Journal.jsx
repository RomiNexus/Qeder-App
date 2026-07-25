import { useState } from 'react'
import { Flame, Bookmark, Trash2, ArrowLeft, Sparkles } from 'lucide-react'
import { getBookmarks, removeBookmark, getStreak } from '../utils/storage'

/**
 * Journal view: shows the user's current streak and every Dua/verse
 * they've bookmarked, stored entirely in localStorage.
 */
export default function Journal({ onBack, onStartCheckin }) {
  const [bookmarks, setBookmarks] = useState(() => getBookmarks())
  const streak = getStreak()

  function handleRemove(id) {
    const updated = removeBookmark(id)
    setBookmarks(updated)
  }

  return (
    <div className="app-shell safe-top safe-bottom px-5 pb-8">
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={onBack}
          aria-label="Go back"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-300 transition-colors active:bg-night-800"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display text-xl font-semibold text-slate-50">Your Journal</h1>
      </div>

      {/* Streak card */}
      <div className="card mt-5 flex items-center gap-4 p-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gold/10 text-gold">
          <Flame size={26} fill="currentColor" className="opacity-90" />
        </div>
        <div>
          <p className="font-display text-2xl font-semibold text-slate-50">
            {streak} {streak === 1 ? 'day' : 'days'}
          </p>
          <p className="text-sm text-slate-400">
            {streak > 0 ? 'Current check-in streak' : 'Check in today to start your streak'}
          </p>
        </div>
      </div>

      {/* Bookmarks */}
      <div className="mt-7 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Saved Duas & Verses
        </h2>
        <span className="text-xs text-slate-500">{bookmarks.length}</span>
      </div>

      {bookmarks.length === 0 ? (
        <EmptyState onStartCheckin={onStartCheckin} />
      ) : (
        <div className="mt-4 space-y-3">
          {bookmarks.map((entry) => (
            <BookmarkRow key={entry.id} entry={entry} onRemove={() => handleRemove(entry.id)} />
          ))}
        </div>
      )}
    </div>
  )
}

function BookmarkRow({ entry, onRemove }) {
  const typeLabel = entry.type === 'quran' ? 'Qur\u2019an' : 'Dua'
  return (
    <div className="card animate-fade-in p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-sky">
            {typeLabel}
          </span>
          <h3 className="mt-0.5 truncate text-[15px] font-semibold text-slate-100">
            {entry.title}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">{entry.source}</p>
        </div>
        <button
          onClick={onRemove}
          aria-label="Remove bookmark"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors active:bg-night-700 active:text-red-400"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <p className="arabic-text mt-4 text-xl leading-relaxed text-slate-100">{entry.arabic}</p>
      <p className="mt-3 text-sm leading-relaxed text-slate-300">&ldquo;{entry.translation}&rdquo;</p>
    </div>
  )
}

function EmptyState({ onStartCheckin }) {
  return (
    <div className="card mt-4 flex flex-col items-center gap-3 px-6 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky/10 text-sky">
        <Bookmark size={22} />
      </div>
      <p className="text-[15px] font-medium text-slate-200">Nothing saved yet</p>
      <p className="text-sm text-slate-500">
        Complete a check-in and tap Save on a Dua or verse to keep it here.
      </p>
      {onStartCheckin && (
        <button onClick={onStartCheckin} className="btn-primary mt-2">
          <Sparkles size={16} />
          Start Today&rsquo;s Check-In
        </button>
      )}
    </div>
  )
}
