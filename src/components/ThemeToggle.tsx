import type { Theme } from '../types/evaluation'

interface ThemeToggleProps {
  theme: Theme
  onToggle: () => void
}

const ThemeToggle = ({ theme, onToggle }: ThemeToggleProps) => (
  <button
    type="button"
    onClick={onToggle}
    aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-sm transition-colors"
    style={{
      background: 'var(--interactive)',
      color: 'var(--text-secondary)',
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
    {theme === 'dark' ? '\u2600\uFE0E' : '\u263E\uFE0E'}
  </button>
)

export default ThemeToggle
