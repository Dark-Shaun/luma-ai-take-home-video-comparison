export type Experiment = 'A' | 'B'

export type Decision = 'left' | 'right' | 'tie'

export type Winner = Experiment | 'tie'

export type Theme = 'dark' | 'light'

export interface VideoPair {
  id: number
  filename: string
  prompt: string
  videoAUrl: string
  videoBUrl: string
}

export interface SideMapping {
  leftExperiment: Experiment
  rightExperiment: Experiment
}

export interface RatingEntry {
  pairId: number
  decision: Decision
  winner: Winner
  ratedAt: string
}

export interface HistoryEntry {
  pairId: number
  previousRating: RatingEntry | null
  previousIndex: number
}

export interface Preferences {
  theme: Theme
  autoAdvance: boolean
}

export interface SessionState {
  currentIndex: number
  ratingsByPairId: Record<number, RatingEntry>
  sideMappingByPairId: Record<number, SideMapping>
  history: HistoryEntry[]
  preferences: Preferences
}
