export type CandyColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple'

export type SpecialType = 'striped-h' | 'striped-v' | 'area-bomb' | 'color-bomb'

export type GamePhase =
  | 'start'
  | 'idle'
  | 'swapping'
  | 'swap-back'
  | 'removing'
  | 'falling'
  | 'levelComplete'
  | 'gameOver'

export interface Position {
  readonly row: number
  readonly col: number
}

export interface CandyData {
  readonly id: number
  readonly color: CandyColor
  readonly special: SpecialType | null
}

export type Board = readonly (readonly (CandyData | null)[])[]

export interface Match {
  readonly positions: readonly Position[]
}

export interface FallInfo {
  readonly candyId: number
  readonly distance: number
}

export interface LevelConfig {
  readonly level: number
  readonly targetScore: number
  readonly moves: number
}

export interface ComboMessage {
  readonly id: number
  readonly text: string
  readonly row: number
  readonly col: number
}

export interface ParticleGroup {
  readonly id: number
  readonly row: number
  readonly col: number
  readonly color: CandyColor
}
