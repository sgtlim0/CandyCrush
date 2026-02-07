import type { Board, Match, Position, CandyData, SpecialType } from './types'
import { ROWS, COLS } from './constants'
import { posKey, nextId } from './board'

export function findMatches(board: Board): readonly Match[] {
  const matches: Match[] = []

  for (let row = 0; row < ROWS; row++) {
    let start = 0
    for (let col = 1; col <= COLS; col++) {
      const current = board[row][col] ?? null
      const startCandy = board[row][start]
      if (
        col < COLS &&
        current !== null &&
        startCandy !== null &&
        current.color === startCandy.color
      ) {
        continue
      }
      if (col - start >= 3 && startCandy !== null) {
        const positions: Position[] = []
        for (let c = start; c < col; c++) {
          positions.push({ row, col: c })
        }
        matches.push({ positions })
      }
      start = col
    }
  }

  for (let col = 0; col < COLS; col++) {
    let start = 0
    for (let row = 1; row <= ROWS; row++) {
      const current = board[row]?.[col] ?? null
      const startCandy = board[start][col]
      if (
        row < ROWS &&
        current !== null &&
        startCandy !== null &&
        current.color === startCandy.color
      ) {
        continue
      }
      if (row - start >= 3 && startCandy !== null) {
        const positions: Position[] = []
        for (let r = start; r < row; r++) {
          positions.push({ row: r, col })
        }
        matches.push({ positions })
      }
      start = row
    }
  }

  return matches
}

export function getMatchedPositions(
  matches: readonly Match[],
): ReadonlySet<string> {
  const set = new Set<string>()
  for (const match of matches) {
    for (const pos of match.positions) {
      set.add(posKey(pos.row, pos.col))
    }
  }
  return set
}

function isHorizontalMatch(match: Match): boolean {
  return match.positions.length >= 2 && match.positions[0].row === match.positions[1].row
}

function findCrossPoints(matches: readonly Match[]): ReadonlySet<string> {
  const hPositions = new Set<string>()
  const vPositions = new Set<string>()

  for (const match of matches) {
    const isH = isHorizontalMatch(match)
    for (const pos of match.positions) {
      const key = posKey(pos.row, pos.col)
      if (isH) hPositions.add(key)
      else vPositions.add(key)
    }
  }

  const crossPoints = new Set<string>()
  for (const key of hPositions) {
    if (vPositions.has(key)) crossPoints.add(key)
  }
  return crossPoints
}

interface SpecialCreation {
  readonly row: number
  readonly col: number
  readonly candy: CandyData
}

export function determineSpecials(
  board: Board,
  matches: readonly Match[],
  swapPos?: Position,
): readonly SpecialCreation[] {
  const specials: SpecialCreation[] = []
  const usedPositions = new Set<string>()
  const crossPoints = findCrossPoints(matches)

  // Handle cross/T/L shapes first → area bomb
  for (const key of crossPoints) {
    if (usedPositions.has(key)) continue
    const [r, c] = key.split(',').map(Number)
    const candy = board[r][c]
    if (!candy) continue

    usedPositions.add(key)
    specials.push({
      row: r,
      col: c,
      candy: { id: nextId(), color: candy.color, special: 'area-bomb' },
    })
  }

  for (const match of matches) {
    const len = match.positions.length
    if (len < 4) continue

    // Skip if any position already used for a cross special
    const hasUsed = match.positions.some((p) => usedPositions.has(posKey(p.row, p.col)))
    if (hasUsed) continue

    let specialPos = match.positions[Math.floor(len / 2)]
    if (swapPos) {
      const inMatch = match.positions.find(
        (p) => p.row === swapPos.row && p.col === swapPos.col,
      )
      if (inMatch) specialPos = inMatch
    }

    const key = posKey(specialPos.row, specialPos.col)
    if (usedPositions.has(key)) continue
    usedPositions.add(key)

    const candy = board[specialPos.row][specialPos.col]
    if (!candy) continue

    let special: SpecialType
    if (len >= 5) {
      special = 'color-bomb'
    } else {
      const isH = isHorizontalMatch(match)
      special = isH ? 'striped-h' : 'striped-v'
    }

    specials.push({
      row: specialPos.row,
      col: specialPos.col,
      candy: { id: nextId(), color: candy.color, special },
    })
  }

  return specials
}

export function activateSpecials(
  board: Board,
  matchedPositions: ReadonlySet<string>,
): ReadonlySet<string> {
  const extra = new Set<string>(matchedPositions)

  for (const key of matchedPositions) {
    const [r, c] = key.split(',').map(Number)
    const candy = board[r]?.[c]
    if (!candy?.special) continue

    if (candy.special === 'striped-h') {
      for (let col = 0; col < COLS; col++) extra.add(posKey(r, col))
    } else if (candy.special === 'striped-v') {
      for (let row = 0; row < ROWS; row++) extra.add(posKey(row, c))
    } else if (candy.special === 'area-bomb') {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr
          const nc = c + dc
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
            extra.add(posKey(nr, nc))
          }
        }
      }
    } else if (candy.special === 'color-bomb') {
      const colorCounts = new Map<string, number>()
      for (const mk of matchedPositions) {
        const [mr, mc] = mk.split(',').map(Number)
        const mc2 = board[mr]?.[mc]
        if (mc2 && mc2.id !== candy.id) {
          colorCounts.set(mc2.color, (colorCounts.get(mc2.color) ?? 0) + 1)
        }
      }
      let targetColor: string = candy.color
      let maxCount = 0
      for (const [color, count] of colorCounts) {
        if (count > maxCount) {
          maxCount = count
          targetColor = color
        }
      }
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          if (board[row][col]?.color === targetColor) {
            extra.add(posKey(row, col))
          }
        }
      }
    }
  }

  return extra
}
