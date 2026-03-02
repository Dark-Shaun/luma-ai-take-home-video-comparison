import { useEffect } from 'react'

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
}

const shortcuts = [
  { key: '1', action: 'Left is better' },
  { key: '2', action: 'Tie / No preference' },
  { key: '3', action: 'Right is better' },
  { key: '\u2190', action: 'Previous pair' },
  { key: '\u2192', action: 'Next pair' },
  { key: 'Space', action: 'Play / Pause both videos' },
  { key: '?', action: 'Toggle this help panel' },
  { key: 'Cmd/Ctrl+Z', action: 'Undo last rating' },
]

const HelpModal = ({ isOpen, onClose }: HelpModalProps) => {
  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'var(--overlay)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts help"
    >
      <div
        className="w-full max-w-md p-6"
        style={{
          background: 'var(--bg-elevated)',
          border: 'var(--border-w) solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Keyboard shortcuts
          </h2>
          <kbd
            className="px-2 py-0.5 font-mono text-[10px]"
            style={{
              background: 'var(--interactive)',
              color: 'var(--text-muted)',
              border: 'var(--border-w) solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            ESC
          </kbd>
        </div>
        <ul className="space-y-0.5">
          {shortcuts.map((item) => (
            <li
              key={item.key}
              className="flex items-center justify-between px-3 py-2.5"
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {item.action}
              </span>
              <kbd
                className="min-w-[2rem] px-2 py-0.5 text-center font-mono text-[11px] font-medium"
                style={{
                  background: 'var(--interactive)',
                  color: 'var(--text-secondary)',
                  border: 'var(--border-w) solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {item.key}
              </kbd>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default HelpModal
