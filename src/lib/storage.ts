import type { Preferences, SessionState, SideMapping, Theme } from '../types/evaluation'

const sessionStorageKey = 'video-eval-session-v1'

export const createDefaultPreferences = (): Preferences => ({
  theme: 'dark',
  autoAdvance: true,
})

const isTheme = (value: unknown): value is Theme =>
  value === 'dark' || value === 'light'

const isSideMapping = (value: unknown): value is SideMapping => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const mapping = value as SideMapping
  return (
    (mapping.leftExperiment === 'A' || mapping.leftExperiment === 'B') &&
    (mapping.rightExperiment === 'A' || mapping.rightExperiment === 'B')
  )
}

export const loadSessionState = (): SessionState | null => {
  const raw = localStorage.getItem(sessionStorageKey)

  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as SessionState

    if (
      typeof parsed.currentIndex !== 'number' ||
      !parsed.ratingsByPairId ||
      !parsed.sideMappingByPairId ||
      !Array.isArray(parsed.history) ||
      !parsed.preferences
    ) {
      return null
    }

    if (
      !isTheme(parsed.preferences.theme) ||
      typeof parsed.preferences.autoAdvance !== 'boolean'
    ) {
      return null
    }

    const mappingValues = Object.values(parsed.sideMappingByPairId)
    if (!mappingValues.every((mapping) => isSideMapping(mapping))) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export const saveSessionState = (session: SessionState): void => {
  localStorage.setItem(sessionStorageKey, JSON.stringify(session))
}

export const clearSessionState = (): void => {
  localStorage.removeItem(sessionStorageKey)
}
