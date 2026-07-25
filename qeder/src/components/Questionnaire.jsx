import { useState } from 'react'
import {
  ChevronLeft,
  Heart,
  Briefcase,
  Users,
  HeartPulse,
  Compass,
  Sparkles,
  Shield,
  HandHeart,
  Feather,
  Sun,
  Home,
  Zap,
  Wind,
  CloudRain,
  Smile,
  MoonStar,
  Timer,
  BookOpenText,
  ScrollText
} from 'lucide-react'

/**
 * Question definitions. Each option carries a small `value` used by the
 * matcher, a human `label`, and an `icon` for quick visual scanning.
 */
const QUESTIONS = [
  {
    key: 'emotion',
    title: 'Heart Check',
    subtitle: 'How does your heart feel right now?',
    options: [
      { value: 'peaceful', label: 'Peaceful', icon: Sun },
      { value: 'anxious', label: 'Anxious / Overwhelmed', icon: Wind },
      { value: 'heavy', label: 'Heavy / Grieving', icon: CloudRain },
      { value: 'grateful', label: 'Grateful', icon: Smile },
      { value: 'numb', label: 'Disconnected / Numb', icon: MoonStar }
    ]
  },
  {
    key: 'focus',
    title: 'Daily Focus',
    subtitle: "What's most on your mind today?",
    options: [
      { value: 'work', label: 'Work & Finances', icon: Briefcase },
      { value: 'family', label: 'Family & Relationships', icon: Users },
      { value: 'health', label: 'Health & Well-being', icon: HeartPulse },
      { value: 'future', label: 'Future Decisions', icon: Compass },
      { value: 'faith', label: 'Faith & Growth', icon: Sparkles }
    ]
  },
  {
    key: 'need',
    title: 'Spiritual Need',
    subtitle: 'What does your soul need most?',
    options: [
      { value: 'patience', label: 'Patience (Sabr)', icon: Feather },
      { value: 'comfort', label: 'Comfort & Reassurance', icon: HandHeart },
      { value: 'forgiveness', label: 'Forgiveness', icon: Heart },
      { value: 'strength', label: 'Strength & Protection', icon: Shield },
      { value: 'guidance', label: 'Clear Guidance', icon: Zap }
    ]
  },
  {
    key: 'gratitude',
    title: 'Gratitude Note',
    subtitle: "What's one thing you're thankful for today?",
    isGratitude: true,
    toggles: [
      { value: 'A warm home', icon: Home },
      { value: 'Good health', icon: HeartPulse },
      { value: 'Loved ones', icon: Users },
      { value: 'Waking up today', icon: Sun }
    ]
  },
  {
    key: 'bandwidth',
    title: 'Capacity',
    subtitle: 'How much time do you have right now?',
    options: [
      { value: 'quick', label: 'Quick Verse', hint: '30 sec', icon: Timer },
      { value: 'dua', label: 'Dua + Meaning', hint: '2 min', icon: BookOpenText },
      { value: 'deep', label: 'Deep Reflection + Context', hint: '5 min', icon: ScrollText }
    ]
  }
]

const TOTAL_STEPS = QUESTIONS.length

/**
 * Step-by-step check-in wizard. Calls `onComplete(answers)` once all 5
 * questions have been answered, where `answers` is:
 *   { emotion, focus, need, gratitude: { tags, note }, bandwidth }
 */
export default function Questionnaire({ onComplete, onExit }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState({
    emotion: null,
    focus: null,
    need: null,
    gratitude: { tags: [], note: '' },
    bandwidth: null
  })

  const question = QUESTIONS[stepIndex]
  const progress = ((stepIndex + 1) / TOTAL_STEPS) * 100
  const isLastStep = stepIndex === TOTAL_STEPS - 1

  function selectOption(value) {
    const updated = { ...answers, [question.key]: value }
    setAnswers(updated)

    // Auto-advance for single-select steps for a smooth, fast-feeling flow.
    if (!isLastStep) {
      setTimeout(() => setStepIndex((i) => i + 1), 220)
    } else {
      onComplete(updated)
    }
  }

  function toggleGratitudeTag(tag) {
    setAnswers((prev) => {
      const current = prev.gratitude.tags
      const nextTags = current.includes(tag)
        ? current.filter((t) => t !== tag)
        : [...current, tag]
      return { ...prev, gratitude: { ...prev.gratitude, tags: nextTags } }
    })
  }

  function setGratitudeNote(note) {
    setAnswers((prev) => ({ ...prev, gratitude: { ...prev.gratitude, note } }))
  }

  function goBack() {
    if (stepIndex === 0) {
      onExit?.()
    } else {
      setStepIndex((i) => i - 1)
    }
  }

  function continueFromGratitude() {
    setStepIndex((i) => i + 1)
  }

  return (
    <div className="app-shell safe-top safe-bottom px-5">
      {/* Header: back button + progress bar */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={goBack}
          aria-label="Go back"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-300 transition-colors active:bg-night-800"
        >
          <ChevronLeft size={22} />
        </button>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-night-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky to-gold transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="w-10 shrink-0 text-right text-xs font-medium text-slate-400">
          {stepIndex + 1}/{TOTAL_STEPS}
        </span>
      </div>

      {/* Question content */}
      <div key={question.key} className="mt-8 flex-1 animate-slide-up">
        <h1 className="font-display text-2xl font-semibold text-slate-50">{question.title}</h1>
        <p className="mt-1.5 text-[15px] text-slate-400">{question.subtitle}</p>

        {question.isGratitude ? (
          <GratitudeStep
            selectedTags={answers.gratitude.tags}
            note={answers.gratitude.note}
            onToggleTag={toggleGratitudeTag}
            onNoteChange={setGratitudeNote}
            onContinue={continueFromGratitude}
          />
        ) : (
          <div className="mt-6 space-y-3">
            {question.options.map((opt) => {
              const Icon = opt.icon
              const selected = answers[question.key] === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => selectOption(opt.value)}
                  className={`option-card flex items-center gap-4 ${
                    selected ? 'option-card-selected' : ''
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      selected ? 'bg-sky/20 text-sky' : 'bg-night-700/60 text-slate-300'
                    }`}
                  >
                    <Icon size={20} />
                  </span>
                  <span className="flex-1">
                    <span className="block text-[15px] font-medium text-slate-100">{opt.label}</span>
                    {opt.hint && <span className="block text-xs text-slate-400">{opt.hint}</span>}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function GratitudeStep({ selectedTags, note, onToggleTag, onNoteChange, onContinue }) {
  const { toggles } = QUESTIONS.find((q) => q.isGratitude)

  return (
    <div className="mt-6">
      <div className="grid grid-cols-2 gap-3">
        {toggles.map(({ value, icon: Icon }) => {
          const selected = selectedTags.includes(value)
          return (
            <button
              key={value}
              onClick={() => onToggleTag(value)}
              className={`option-card flex flex-col items-start gap-2.5 ${
                selected ? 'option-card-selected' : ''
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  selected ? 'bg-sky/20 text-sky' : 'bg-night-700/60 text-slate-300'
                }`}
              >
                <Icon size={17} />
              </span>
              <span className="text-sm font-medium leading-tight text-slate-100">{value}</span>
            </button>
          )
        })}
      </div>

      <label className="mt-5 block">
        <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
          Anything else? (optional)
        </span>
        <textarea
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="I'm grateful for..."
          rows={3}
          maxLength={200}
          className="w-full resize-none rounded-2xl border border-night-700 bg-night-800/60 px-4 py-3 text-[15px] text-slate-100 placeholder:text-slate-500 focus:border-sky focus:outline-none focus:ring-1 focus:ring-sky"
        />
      </label>

      <button onClick={onContinue} className="btn-primary mt-6 w-full">
        Continue
      </button>
    </div>
  )
}
