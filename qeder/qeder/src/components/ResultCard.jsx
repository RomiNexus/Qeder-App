import { useEffect, useRef, useState } from 'react'
import {
  Play,
  Pause,
  Loader2,
  ChevronDown,
  Bookmark,
  Share2,
  RotateCcw,
  BookOpen,
  Check,
  Home
} from 'lucide-react'
import { isBookmarked, toggleBookmark } from '../utils/storage'

/**
 * The 3-pillar result display:
 *   1. Arabic script (large, RTL, calligraphic serif)
 *   2. Transliteration + English translation (clear hierarchy)
 *   3. Context / Tafsir (expandable accordion for deeper bandwidth users)
 * Plus an HTML5 audio player and an action bar (bookmark + share).
 */
export default function ResultCard({ result, onRestart, onViewJournal }) {
  const [bookmarked, setBookmarked] = useState(() => isBookmarked(result.id))
  const [contextOpen, setContextOpen] = useState(result.tags.bandwidth.includes('deep'))
  const [shareState, setShareState] = useState('idle') // idle | copied

  const audioRef = useRef(null)
  const [audioState, setAudioState] = useState('idle') // idle | loading | playing | paused | error

  useEffect(() => {
    // Reset local UI state whenever a new result is shown.
    setBookmarked(isBookmarked(result.id))
    setContextOpen(result.tags.bandwidth.includes('deep'))
    setAudioState('idle')
  }, [result.id])

  function handleBookmarkToggle() {
    toggleBookmark(result)
    setBookmarked((prev) => !prev)
  }

  async function handleShare() {
    const shareText = `${result.arabic}\n\n"${result.translation}"\n— ${result.source}\n\nShared from Qeder`
    try {
      if (navigator.share) {
        await navigator.share({ title: result.title, text: shareText })
        return
      }
    } catch {
      // User cancelled the native share sheet — fall through silently.
      return
    }
    try {
      await navigator.clipboard.writeText(shareText)
      setShareState('copied')
      setTimeout(() => setShareState('idle'), 1800)
    } catch {
      // Clipboard API unavailable — nothing more we can do client-side.
    }
  }

  function togglePlayback() {
    const audio = audioRef.current
    if (!audio) return

    if (audioState === 'playing') {
      audio.pause()
      return
    }

    setAudioState('loading')
    audio.play().catch(() => setAudioState('error'))
  }

  const typeLabel = result.type === 'quran' ? 'Qur\u2019an' : 'Dua'

  return (
    <div className="app-shell safe-top safe-bottom px-5 pb-8">
      <div className="flex items-center justify-between pt-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold">
          <BookOpen size={12} />
          {typeLabel} Match
        </span>
        <button
          onClick={onViewJournal}
          className="text-xs font-medium text-slate-400 underline-offset-4 hover:underline"
        >
          Journal
        </button>
      </div>

      <div className="card mt-4 animate-fade-in overflow-hidden">
        <div className="px-6 pt-7">
          <h1 className="font-display text-lg font-semibold text-slate-50">{result.title}</h1>
          <p className="mt-0.5 text-xs text-slate-500">{result.source}</p>

          {/* Pillar 1: Arabic script */}
          <p className="arabic-text mt-6 text-[28px] leading-[1.9] text-slate-50">
            {result.arabic}
          </p>

          {/* Pillar 2: Transliteration + Translation */}
          <div className="mt-6 space-y-3 border-t border-night-700 pt-5">
            <p className="text-[13px] italic leading-relaxed text-sky-light">
              {result.transliteration}
            </p>
            <p className="text-[16px] font-medium leading-relaxed text-slate-100">
              &ldquo;{result.translation}&rdquo;
            </p>
          </div>

          {/* Audio player */}
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-night-700 bg-night-900/60 px-4 py-3">
            <button
              onClick={togglePlayback}
              aria-label={audioState === 'playing' ? 'Pause recitation' : 'Play recitation'}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky text-night-900 transition-transform active:scale-95"
            >
              {audioState === 'loading' ? (
                <Loader2 size={18} className="animate-spin" />
              ) : audioState === 'playing' ? (
                <Pause size={18} fill="currentColor" />
              ) : (
                <Play size={18} fill="currentColor" className="ml-0.5" />
              )}
            </button>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-200">Listen to recitation</p>
              <p className="text-xs text-slate-500">
                {audioState === 'error' ? 'Audio unavailable offline' : 'Mishary Rashid Alafasy'}
              </p>
            </div>
            <audio
              ref={audioRef}
              src={result.audioUrl}
              preload="none"
              onPlaying={() => setAudioState('playing')}
              onPause={() => setAudioState('paused')}
              onEnded={() => setAudioState('idle')}
              onError={() => setAudioState('error')}
            />
          </div>
        </div>

        {/* Pillar 3: Context / Tafsir accordion */}
        <button
          onClick={() => setContextOpen((v) => !v)}
          className="mt-6 flex w-full items-center justify-between border-t border-night-700 px-6 py-4 text-left"
        >
          <span className="text-sm font-semibold text-slate-200">Context & Reflection</span>
          <ChevronDown
            size={18}
            className={`text-slate-400 transition-transform duration-300 ${
              contextOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        <div
          className={`grid overflow-hidden transition-all duration-300 ease-out ${
            contextOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden px-6 pb-6">
            <p className="text-[14px] leading-relaxed text-slate-400">{result.context}</p>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          onClick={handleBookmarkToggle}
          className={`btn-secondary ${bookmarked ? '!border-gold !bg-gold/10 !text-gold' : ''}`}
        >
          <Bookmark size={17} fill={bookmarked ? 'currentColor' : 'none'} />
          {bookmarked ? 'Saved' : 'Save'}
        </button>
        <button onClick={handleShare} className="btn-secondary">
          {shareState === 'copied' ? <Check size={17} /> : <Share2 size={17} />}
          {shareState === 'copied' ? 'Copied' : 'Share'}
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <button onClick={onRestart} className="btn-secondary">
          <RotateCcw size={17} />
          Check In Again
        </button>
        <button onClick={onViewJournal} className="btn-primary">
          <Home size={17} />
          Journal
        </button>
      </div>
    </div>
  )
}
