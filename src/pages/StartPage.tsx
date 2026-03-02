import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import type { Theme } from '../types/evaluation'

interface StartPageProps {
  totalPairs: number
  ratedPairs: number
  theme: Theme
  onStart: () => void
  onRestart: () => void
  onToggleTheme: () => void
}

const StatusBadge = ({ ratedPairs, totalPairs }: { ratedPairs: number; totalPairs: number }) => {
  if (ratedPairs === 0) {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
        style={{ background: 'var(--interactive)', color: 'var(--text-muted)' }}
      >
        <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'var(--text-muted)' }} />
        Not started
      </span>
    )
  }

  if (ratedPairs === totalPairs) {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
        style={{ background: 'rgba(52, 211, 153, 0.12)', color: 'var(--success)' }}
      >
        <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'var(--success)' }} />
        Completed
      </span>
    )
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
      style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
      In progress
    </span>
  )
}

const StartPage = ({ totalPairs, ratedPairs, theme, onStart, onRestart, onToggleTheme }: StartPageProps) => {
  const progressPct = totalPairs > 0 ? Math.round((ratedPairs / totalPairs) * 100) : 0
  const [isRestartModalOpen, setIsRestartModalOpen] = useState(false)

  const handleOpenRestartModal = () => setIsRestartModalOpen(true)
  const handleCloseRestartModal = () => setIsRestartModalOpen(false)
  const handleConfirmRestart = () => {
    handleCloseRestartModal()
    onRestart()
  }
  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onStart()
    }
  }

  useEffect(() => {
    if (!isRestartModalOpen) {
      return
    }

    const handleWindowKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseRestartModal()
      }
    }

    window.addEventListener('keydown', handleWindowKeyDown)
    return () => {
      window.removeEventListener('keydown', handleWindowKeyDown)
    }
  }, [isRestartModalOpen])

  return (
    <div className="min-h-screen">
      <Navbar theme={theme} onToggleTheme={onToggleTheme} />

      <main className="mx-auto w-full max-w-5xl px-4 py-10">
        <div className="mb-2">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Evaluations
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Select an evaluation to begin blind pairwise video comparison
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            className="group cursor-pointer text-left transition-all duration-150"
            role="button"
            tabIndex={0}
            aria-label="Open video generation comparison evaluation"
            onClick={onStart}
            onKeyDown={handleCardKeyDown}
            style={{
              background: 'var(--bg-panel)',
              border: 'var(--border-w) solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)'
              e.currentTarget.style.boxShadow = 'var(--shadow-md)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)'
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
            }}
          >
            <div className="p-5">
              <div className="mb-3 flex items-start justify-between">
                <div
                  className="flex h-10 w-10 items-center justify-center text-base font-bold"
                  style={{
                    background: 'var(--accent)',
                    color: 'var(--accent-text)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  V
                </div>
                <StatusBadge ratedPairs={ratedPairs} totalPairs={totalPairs} />
              </div>

              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Video Generation Comparison
              </h2>
              <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Compare outputs from two video generation experiments across {totalPairs} prompts.
                Rate each pair to determine which model performs better.
              </p>

              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium">
                  <span style={{ color: 'var(--text-muted)' }}>
                    {ratedPairs} of {totalPairs} pairs
                  </span>
                  <span style={{ color: 'var(--accent)' }}>{progressPct}%</span>
                </div>
                <div
                  className="h-1.5 w-full overflow-hidden rounded-full"
                  style={{ background: 'var(--interactive)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(progressPct, ratedPairs > 0 ? 2 : 0)}%`,
                      background: 'var(--accent)',
                    }}
                  />
                </div>
              </div>
            </div>

            <div
              className="flex items-center justify-between gap-2 px-5 py-3"
              style={{ borderTop: 'var(--border-w) solid var(--border-subtle)' }}
            >
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                Exp A vs Exp B
              </span>
              <div className="flex items-center gap-2">
                {ratedPairs > 0 ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      handleOpenRestartModal()
                    }}
                    aria-label="Restart this evaluation"
                    className="cursor-pointer px-2 py-1 text-[11px] font-semibold transition-colors"
                    style={{
                      background: 'var(--danger-subtle)',
                      color: 'var(--danger)',
                      border: 'var(--border-w) solid var(--danger)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--danger)'
                      e.currentTarget.style.color = 'var(--accent-text)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--danger-subtle)'
                      e.currentTarget.style.color = 'var(--danger)'
                    }}
                  >
                    Restart
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    onStart()
                  }}
                  aria-label="Open video generation comparison evaluation"
                  className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold transition-colors"
                  style={{ color: 'var(--accent)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--accent-hover)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--accent)'
                  }}
                >
                  {ratedPairs > 0 ? 'Continue' : 'Start'}
                  <span className="transition-transform duration-150 group-hover:translate-x-0.5">{'\u2192'}</span>
                </button>
              </div>
            </div>
          </div>

          <div
            className="flex cursor-default flex-col items-center justify-center p-8 text-center"
            style={{
              background: 'var(--bg-panel)',
              border: 'var(--border-w) dashed var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              opacity: 0.5,
            }}
          >
            <div
              className="mb-2 flex h-10 w-10 items-center justify-center text-lg"
              style={{ color: 'var(--text-muted)' }}
            >
              +
            </div>
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              More evaluations coming soon
            </p>
          </div>
        </div>

        <div
          className="mt-8 p-4"
          style={{
            background: 'var(--bg-panel)',
            border: 'var(--border-w) solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Keyboard shortcuts
          </p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-xs sm:grid-cols-3" style={{ color: 'var(--text-secondary)' }}>
            {[
              { key: '1', label: 'Left wins' },
              { key: '2', label: 'Tie' },
              { key: '3', label: 'Right wins' },
              { key: 'Space', label: 'Play / Pause' },
              { key: '\u2190 \u2192', label: 'Navigate pairs' },
              { key: '?', label: 'All shortcuts' },
            ].map((item) => (
              <span key={item.key} className="flex items-center gap-1.5">
                <kbd
                  className="inline-flex min-w-7 items-center justify-center px-1.5 py-0.5 font-mono text-[10px]"
                  style={{
                    background: 'var(--interactive)',
                    border: 'var(--border-w) solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {item.key}
                </kbd>
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </main>

      {isRestartModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'var(--overlay)' }}
          onClick={handleCloseRestartModal}
          role="dialog"
          aria-modal="true"
          aria-label="Restart session confirmation"
        >
          <div
            className="w-full max-w-md p-5"
            style={{
              background: 'var(--bg-panel)',
              border: 'var(--border-w) solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              Restart session?
            </h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              This will clear all current ratings for this evaluation.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleCloseRestartModal}
                className="cursor-pointer px-3 py-1.5 text-xs font-semibold transition-colors"
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
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRestart}
                className="cursor-pointer px-3 py-1.5 text-xs font-semibold transition-colors"
                style={{
                  background: 'var(--danger-subtle)',
                  color: 'var(--danger)',
                  border: 'var(--border-w) solid var(--danger)',
                  borderRadius: 'var(--radius-sm)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--danger)'
                  e.currentTarget.style.color = 'var(--accent-text)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--danger-subtle)'
                  e.currentTarget.style.color = 'var(--danger)'
                }}
              >
                Restart
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default StartPage
