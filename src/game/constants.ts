import type { CandyColor, LevelConfig } from './types'

export const ROWS = 8
export const COLS = 8

export const CANDY_COLORS: readonly CandyColor[] = [
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'purple',
]

export const ANIM_SWAP = 250
export const ANIM_REMOVE = 200
export const ANIM_FALL = 300

export const POINTS_BASE = 10
export const POINTS_FOUR = 30
export const POINTS_FIVE = 50
export const COMBO_MULTIPLIER = 1.5

export const LEVELS: readonly LevelConfig[] = [
  { level: 1, targetScore: 1000, moves: 30 },
  { level: 2, targetScore: 2500, moves: 28 },
  { level: 3, targetScore: 4000, moves: 25 },
  { level: 4, targetScore: 6000, moves: 22 },
  { level: 5, targetScore: 8500, moves: 20 },
  { level: 6, targetScore: 11000, moves: 20 },
  { level: 7, targetScore: 14000, moves: 18 },
  { level: 8, targetScore: 17500, moves: 16 },
  { level: 9, targetScore: 21000, moves: 15 },
  { level: 10, targetScore: 25000, moves: 15 },
]

export const COLOR_MAP: Record<CandyColor, { light: string; dark: string }> = {
  red: { light: '#ff6b6b', dark: '#c0392b' },
  orange: { light: '#ffa726', dark: '#e67e22' },
  yellow: { light: '#ffee58', dark: '#f9a825' },
  green: { light: '#66bb6a', dark: '#2e7d32' },
  blue: { light: '#42a5f5', dark: '#1565c0' },
  purple: { light: '#ab47bc', dark: '#7b1fa2' },
}
