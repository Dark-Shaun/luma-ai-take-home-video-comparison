import { useEffect, useRef } from 'react'
import type { Decision, VideoPair } from '../types/evaluation'

interface PairsSidebarProps {
  isOpen: boolean
  onClose: () => void
  pairs: VideoPair[]
  currentIndex: number
  ratingsByPairId: Record<number, { decision: Decision }>
  onJumpToPair: (index: number) => void
}

const decisionLabel = (decision: Decision): string => {
  if (decision === 'left') return 'Left'
  if (decision === 'right') return 'Right'
  return 'Tie'
}

const PairsSidebar = ({
  isOpen,
  onClose,
  pairs,
  currentIndex,
  ratingsByPairId,
  onJumpToPair,
}: PairsSidebarProps) => {
  const listRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen && activeRef.current) {
      activeRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  }, [isOpen, currentIndex])

  const ratedCount = Object.keys(ratingsByPairId).length

  return (
    <>
      <div
        className="fixed inset-0 z-40 transition-opacity duration-200"
        style={{
          background: 'var(--overlay)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      <aside
        className="fixed inset-y-0 left-0 z-50 flex w-80 flex-col transition-transform duration-250 ease-out"
        style={{
          background: 'var(--bg-panel)',
          borderRight: 'var(--border-w) solid var(--border-subtle)',
          boxShadow: isOpen ? 'var(--shadow-lg)' : 'none',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
        aria-label="Pairs navigator"
        aria-hidden={!isOpen}
      >
        <div
          className="flex items-center justify-between px-4 py-3.5"
          style={{ borderBottom: 'var(--border-w) solid var(--border-subtle)' }}
        >
          <div>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              All pairs
            </h2>
            <p className="mt-0.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {ratedCount} of {pairs.length} rated
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="flex h-7 w-7 items-center justify-center text-sm transition-colors"
            style={{
              background: 'var(--interactive)',
              color: 'var(--text-secondary)',
              borderRadius: 'var(--radius-sm)',
              border: 'var(--border-w) solid var(--border-subtle)',
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
            {'\u2715'}
          </button>
        </div>

        <div className="mx-4 my-3">
          <div
            className="h-1.5 w-full overflow-hidden rounded-full"
            style={{ background: 'var(--interactive)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${pairs.length > 0 ? Math.round((ratedCount / pairs.length) * 100) : 0}%`,
                background: 'var(--accent)',
              }}
            />
          </div>
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto px-2 pb-4">
          {pairs.map((pair, index) => {
            const isCurrent = index === currentIndex
            const rating = ratingsByPairId[pair.id]
            const isRated = !!rating

            return (
              <button
                key={pair.id}
                ref={isCurrent ? activeRef : undefined}
                type="button"
                onClick={() => {
                  onJumpToPair(index)
                  onClose()
                }}
                aria-label={`Go to pair ${index + 1}`}
                className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors"
                style={{
                  background: isCurrent ? 'var(--accent-subtle)' : 'transparent',
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: isCurrent ? '2px solid var(--accent)' : '2px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isCurrent) {
                    e.currentTarget.style.background = 'var(--interactive)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isCurrent) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center text-[10px] font-bold"
                  style={{
                    background: isCurrent ? 'var(--accent)' : isRated ? 'var(--interactive-active)' : 'var(--interactive)',
                    color: isCurrent ? 'var(--accent-text)' : isRated ? 'var(--text-primary)' : 'var(--text-muted)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  {index + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-xs font-medium"
                    style={{ color: isCurrent ? 'var(--accent)' : 'var(--text-primary)' }}
                  >
                    {pair.prompt}
                  </p>
                  <p className="truncate text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {pair.filename}
                  </p>
                </div>

                {isRated ? (
                  <span
                    className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase"
                    style={{
                      background: 'var(--accent-subtle)',
                      color: 'var(--accent)',
                    }}
                  >
                    {decisionLabel(rating.decision)}
                  </span>
                ) : (
                  <span
                    className="shrink-0 text-[9px] font-medium uppercase"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {'\u2022'}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </aside>
    </>
  )
}

export default PairsSidebar
