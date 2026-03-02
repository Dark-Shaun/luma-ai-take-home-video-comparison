import { useEffect } from 'react'

interface HotkeyHandlers {
  onLeftDecision: () => void
  onTieDecision: () => void
  onRightDecision: () => void
  onPrevious: () => void
  onNext: () => void
  onTogglePlayback: () => void
  onToggleHelp: () => void
  onUndo: () => void
}

const isTypingTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  const tagName = target.tagName.toLowerCase()
  return target.isContentEditable || tagName === 'input' || tagName === 'textarea' || tagName === 'select'
}

export const useHotkeys = (handlers: HotkeyHandlers, enabled: boolean): void => {
  useEffect(() => {
    if (!enabled) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (isTypingTarget(event.target)) {
        return
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        handlers.onUndo()
        return
      }

      if (event.key === '1') {
        event.preventDefault()
        handlers.onLeftDecision()
        return
      }

      if (event.key === '2') {
        event.preventDefault()
        handlers.onTieDecision()
        return
      }

      if (event.key === '3') {
        event.preventDefault()
        handlers.onRightDecision()
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        handlers.onPrevious()
        return
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        handlers.onNext()
        return
      }

      if (event.key === ' ' || event.code === 'Space') {
        event.preventDefault()
        handlers.onTogglePlayback()
        return
      }

      if (event.key === '?') {
        event.preventDefault()
        handlers.onToggleHelp()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled, handlers])
}
