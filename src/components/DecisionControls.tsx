import type { Decision } from '../types/evaluation'

interface DecisionControlsProps {
  currentDecision: Decision | null
  onChooseLeft: () => void
  onChooseTie: () => void
  onChooseRight: () => void
}

const DecisionButton = ({
  isActive,
  onClick,
  label,
  shortcut,
  ariaLabel,
}: {
  isActive: boolean
  onClick: () => void
  label: string
  shortcut: string
  ariaLabel: string
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={ariaLabel}
    className="w-full cursor-pointer px-4 py-3.5 text-sm font-semibold transition-all duration-150"
    style={{
      background: isActive ? 'var(--accent)' : 'var(--interactive)',
      color: isActive ? 'var(--accent-text)' : 'var(--text-secondary)',
      border: `var(--border-w) solid ${isActive ? 'var(--accent)' : 'var(--border-subtle)'}`,
      borderRadius: 'var(--radius-sm)',
      boxShadow: isActive ? 'var(--shadow-md)' : 'none',
    }}
    onMouseEnter={(e) => {
      if (!isActive) {
        e.currentTarget.style.background = 'var(--interactive-hover)'
        e.currentTarget.style.color = 'var(--text-primary)'
        e.currentTarget.style.borderColor = 'var(--border-default)'
      }
    }}
    onMouseLeave={(e) => {
      if (!isActive) {
        e.currentTarget.style.background = 'var(--interactive)'
        e.currentTarget.style.color = 'var(--text-secondary)'
        e.currentTarget.style.borderColor = 'var(--border-subtle)'
      }
    }}
  >
    {label} <kbd className="ml-1 text-[10px] opacity-50">[{shortcut}]</kbd>
  </button>
)

const DecisionControls = ({
  currentDecision,
  onChooseLeft,
  onChooseTie,
  onChooseRight,
}: DecisionControlsProps) => (
  <div className="grid grid-cols-3 gap-3">
    <DecisionButton
      isActive={currentDecision === 'left'}
      onClick={onChooseLeft}
      label="Left better"
      shortcut="1"
      ariaLabel="Rate left video as better"
    />
    <DecisionButton
      isActive={currentDecision === 'tie'}
      onClick={onChooseTie}
      label="Tie"
      shortcut="2"
      ariaLabel="Rate videos as tie"
    />
    <DecisionButton
      isActive={currentDecision === 'right'}
      onClick={onChooseRight}
      label="Right better"
      shortcut="3"
      ariaLabel="Rate right video as better"
    />
  </div>
)

export default DecisionControls
