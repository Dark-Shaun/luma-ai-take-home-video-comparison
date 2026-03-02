import { type RefObject, useState } from 'react'
import DecisionControls from '../components/DecisionControls'
import Navbar from '../components/Navbar'
import PairsSidebar from '../components/PairsSidebar'
import VideoPanel from '../components/VideoPanel'
import VideoTimeline from '../components/VideoTimeline'
import type { Decision, RatingEntry, Theme, VideoPair } from '../types/evaluation'

interface RatingPageProps {
  pair: VideoPair
  pairNumber: number
  totalPairs: number
  progressPercent: number
  currentIndex: number
  currentDecision: Decision | null
  leftVideoSrc: string
  rightVideoSrc: string
  isPlaying: boolean
  autoAdvance: boolean
  theme: Theme
  canGoPrevious: boolean
  canGoNext: boolean
  allPairs: VideoPair[]
  ratingsByPairId: Record<number, RatingEntry>
  onJumpToPair: (index: number) => void
  onToggleTheme: () => void
  onToggleAutoAdvance: () => void
  onChooseLeft: () => void
  onChooseTie: () => void
  onChooseRight: () => void
  onPrevious: () => void
  onNext: () => void
  onTogglePlayback: () => void
  onOpenHelp: () => void
  onUndo: () => void
  undoToast: { kind: 'success' | 'info'; message: string } | null
  canOpenSummary: boolean
  onOpenSummary: () => void
  leftVideoRef: RefObject<HTMLVideoElement | null>
  rightVideoRef: RefObject<HTMLVideoElement | null>
}

const pillStyle: React.CSSProperties = {
  background: 'var(--interactive)',
  color: 'var(--text-secondary)',
  border: 'var(--border-w) solid var(--border-subtle)',
  borderRadius: 'var(--radius-sm)',
}

const handlePillEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.background = 'var(--interactive-hover)'
  e.currentTarget.style.color = 'var(--text-primary)'
  e.currentTarget.style.borderColor = 'var(--border-default)'
}

const handlePillLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.background = 'var(--interactive)'
  e.currentTarget.style.color = 'var(--text-secondary)'
  e.currentTarget.style.borderColor = 'var(--border-subtle)'
}

const RatingPage = ({
  pair,
  pairNumber,
  totalPairs,
  progressPercent,
  currentIndex,
  currentDecision,
  leftVideoSrc,
  rightVideoSrc,
  isPlaying,
  autoAdvance,
  theme,
  canGoPrevious,
  canGoNext,
  allPairs,
  ratingsByPairId,
  onJumpToPair,
  onToggleTheme,
  onToggleAutoAdvance,
  onChooseLeft,
  onChooseTie,
  onChooseRight,
  onPrevious,
  onNext,
  onTogglePlayback,
  onOpenHelp,
  onUndo,
  undoToast,
  canOpenSummary,
  onOpenSummary,
  leftVideoRef,
  rightVideoRef,
}: RatingPageProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const ratedCount = Object.keys(ratingsByPairId).length

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Navbar theme={theme} onToggleTheme={onToggleTheme} onOpenHelp={onOpenHelp}>
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open pairs navigator"
          className="mr-1 flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium transition-colors"
          style={{
            background: 'var(--interactive)',
            color: 'var(--text-secondary)',
            border: 'var(--border-w) solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--interactive-hover)'
            e.currentTarget.style.color = 'var(--text-primary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--interactive)'
            e.currentTarget.style.color = 'var(--text-secondary)'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.7 }}>
            <rect x="1" y="2" width="14" height="2" rx="1" fill="currentColor" />
            <rect x="1" y="7" width="14" height="2" rx="1" fill="currentColor" />
            <rect x="1" y="12" width="14" height="2" rx="1" fill="currentColor" />
          </svg>
          {pairNumber}/{totalPairs}
        </button>
      </Navbar>

      <div className="mx-auto w-full max-w-7xl px-4 pt-1">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
            {ratedCount} of {totalPairs} rated
          </span>
          <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
            {progressPercent}%
          </span>
        </div>
        <div className="overflow-hidden rounded-full" style={{ background: 'var(--border-subtle)', height: '3px' }}>
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.max(progressPercent, 1)}%`, background: 'var(--accent)' }}
          />
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 py-2">
        <div className="mb-2 flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center text-xs font-bold"
            style={{
              background: 'var(--accent-subtle)',
              color: 'var(--accent)',
              border: 'var(--border-w) solid var(--accent)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {pairNumber}
          </div>
          <div>
            <h1 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Pair {pairNumber}
              <span className="ml-1.5 font-normal" style={{ color: 'var(--text-muted)' }}>of {totalPairs}</span>
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{pair.prompt}</p>
          </div>
        </div>

        <section className="grid gap-3 lg:grid-cols-2">
          <VideoPanel title="Left" videoSrc={leftVideoSrc} ref={leftVideoRef} />
          <VideoPanel title="Right" videoSrc={rightVideoSrc} ref={rightVideoRef} />
        </section>

        <VideoTimeline
          key={leftVideoSrc}
          leftVideoRef={leftVideoRef}
          rightVideoRef={rightVideoRef}
          isPlaying={isPlaying}
        />

        <section
          className="mt-3 space-y-2.5 p-3"
          style={{
            background: 'var(--bg-panel)',
            border: 'var(--border-w) solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onTogglePlayback}
              aria-label="Toggle playback"
              className="px-2.5 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-30"
              style={pillStyle}
              onMouseEnter={handlePillEnter}
              onMouseLeave={handlePillLeave}
            >
              {isPlaying ? '\u23F8\u2002Pause' : '\u25B6\u2002Play'}
            </button>
            <button
              type="button"
              onClick={onToggleAutoAdvance}
              aria-label="Toggle auto advance"
              className="px-2.5 py-1.5 text-xs font-medium transition-colors"
              style={{
                background: autoAdvance ? 'var(--accent-subtle)' : 'var(--interactive)',
                color: autoAdvance ? 'var(--accent)' : 'var(--text-secondary)',
                border: `var(--border-w) solid ${autoAdvance ? 'var(--accent)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-sm)',
              }}
              onMouseEnter={(e) => {
                if (!autoAdvance) {
                  handlePillEnter(e)
                }
              }}
              onMouseLeave={(e) => {
                if (!autoAdvance) {
                  handlePillLeave(e)
                } else {
                  e.currentTarget.style.background = 'var(--accent-subtle)'
                  e.currentTarget.style.color = 'var(--accent)'
                  e.currentTarget.style.borderColor = 'var(--accent)'
                }
              }}
            >
              Auto-advance: {autoAdvance ? 'On' : 'Off'}
            </button>
            <button
              type="button"
              onClick={onUndo}
              aria-label="Undo vote"
              className="px-2.5 py-1.5 text-xs font-medium transition-colors"
              style={pillStyle}
              onMouseEnter={handlePillEnter}
              onMouseLeave={handlePillLeave}
            >
              Undo vote
            </button>
          </div>

          <DecisionControls
            currentDecision={currentDecision}
            onChooseLeft={onChooseLeft}
            onChooseTie={onChooseTie}
            onChooseRight={onChooseRight}
          />

          <div className="flex items-center justify-between">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {currentDecision
                ? <span>Current pair vote: <span className="font-semibold" style={{ color: 'var(--accent)' }}>{currentDecision === 'tie' ? 'Tie' : currentDecision === 'left' ? 'Left' : 'Right'}</span></span>
                : <span className="italic">No vote yet</span>
              }
            </p>
            <div className="flex items-center gap-2">
              {canOpenSummary ? (
                <button
                  type="button"
                  onClick={onOpenSummary}
                  aria-label="View summary"
                  className="px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-[0.98]"
                  style={{
                    background: 'var(--accent)',
                    color: 'var(--accent-text)',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-hover)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)' }}
                >
                  View Summary
                </button>
              ) : null}
              <button
                type="button"
                onClick={onPrevious}
                disabled={!canGoPrevious}
                aria-label="Previous pair"
                className="px-2.5 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-30"
                style={pillStyle}
                onMouseEnter={(e) => { if (canGoPrevious) handlePillEnter(e) }}
                onMouseLeave={handlePillLeave}
              >
                {'\u2190'} Prev
              </button>
              <button
                type="button"
                onClick={onNext}
                disabled={!canGoNext}
                aria-label="Next pair"
                className="px-2.5 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-30"
                style={pillStyle}
                onMouseEnter={(e) => { if (canGoNext) handlePillEnter(e) }}
                onMouseLeave={handlePillLeave}
              >
                Next {'\u2192'}
              </button>
            </div>
          </div>
        </section>
      </main>

      <PairsSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        pairs={allPairs}
        currentIndex={currentIndex}
        ratingsByPairId={ratingsByPairId}
        onJumpToPair={onJumpToPair}
      />

      {undoToast ? (
        <div
          className="pointer-events-none fixed bottom-4 right-4 z-50 px-3.5 py-2 text-xs font-medium shadow-lg"
          style={{
            background: undoToast.kind === 'success' ? 'var(--accent-subtle)' : 'var(--bg-elevated)',
            color: undoToast.kind === 'success' ? 'var(--accent)' : 'var(--text-secondary)',
            border: `var(--border-w) solid ${undoToast.kind === 'success' ? 'var(--accent)' : 'var(--border-subtle)'}`,
            borderRadius: 'var(--radius-sm)',
          }}
          aria-live="polite"
        >
          {undoToast.message}
        </div>
      ) : null}
    </div>
  )
}

export default RatingPage
