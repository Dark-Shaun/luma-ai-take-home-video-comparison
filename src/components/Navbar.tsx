import { Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import type { Theme } from '../types/evaluation'

interface NavbarProps {
  theme: Theme
  onToggleTheme: () => void
  onOpenHelp?: () => void
  children?: React.ReactNode
}

const Navbar = ({ theme, onToggleTheme, onOpenHelp, children }: NavbarProps) => (
  <nav
    className="sticky top-0 z-40"
    style={{
      background: 'var(--bg-panel)',
      borderBottom: 'var(--border-w) solid var(--border-subtle)',
      boxShadow: 'var(--shadow-sm)',
    }}
  >
    <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
      <Link to="/" className="flex items-center gap-3 no-underline transition-opacity hover:opacity-80" aria-label="Go to dashboard">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-xs font-bold"
          style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
        >
          V
        </div>
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Video Eval
        </span>
      </Link>
      <div className="flex items-center gap-2">
        {children}
        {onOpenHelp ? (
          <button
            type="button"
            onClick={onOpenHelp}
            aria-label="Open keyboard shortcuts"
            className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] font-mono text-xs transition-colors"
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
            ?
          </button>
        ) : null}
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </div>
  </nav>
)

export default Navbar
