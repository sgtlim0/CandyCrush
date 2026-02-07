import type { Board, CandyData, FallInfo } from './types'
import { ROWS, COLS } from './constants'
import { createCandy } from './board'

interface GravityResult {
  readonly board: Board
  readonly falls: readonly FallInfo[]
  readonly newCandyIds: ReadonlySet<number>
}

export function applyGravityAndFill(
  board: Board,
  removedPositions: ReadonlySet<string>,
  specials: readonly { row: number; col: number; candy: CandyData }[],
): GravityResult {
  const newBoard: (CandyData | null)[][] = board.map((row) => [...row])
  const falls: FallInfo[] = []
  const newCandyIds = new Set<number>()

  // Place specials before removing (they survive the removal)
  const specialPositions = new Set<string>()
  for (const sp of specials) {
    const key = `${sp.row},${sp.col}`
    specialPositions.add(key)
    newBoard[sp.row][sp.col] = sp.candy
    newCandyIds.add(sp.candy.id)
  }

  // Remove matched candies (except specials just placed)
  for (const key of removedPositions) {
    if (specialPositions.has(key)) continue
    const [r, c] = key.split(',').map(Number)
    newBoard[r][c] = null
  }

  // Apply gravity column by column
  for (let col = 0; col < COLS; col++) {
    // Collect non-null candies from bottom to top
    const candies: CandyData[] = []
    for (let row = ROWS - 1; row >= 0; row--) {
      const candy = newBoard[row][col]
      if (candy !== null) {
        candies.push(candy)
      }
    }

    // Place back from bottom, track fall distances
    let writeRow = ROWS - 1
    for (const candy of candies) {
      // Find original row
      let origRow = -1
      for (let r = 0; r < ROWS; r++) {
        if (newBoard[r][col]?.id === candy.id) {
          origRow = r
          break
        }
      }
      const fallDist = writeRow - origRow
      if (fallDist > 0) {
        falls.push({ candyId: candy.id, distance: fallDist })
      }
      writeRow--
    }

    // Now actually rearrange the column
    const colCandies: CandyData[] = []
    for (let row = ROWS - 1; row >= 0; row--) {
      if (newBoard[row][col] !== null) {
        colCandies.push(newBoard[row][col]!)
      }
    }

    // Fill from bottom with existing candies
    let idx = 0
    for (let row = ROWS - 1; row >= 0; row--) {
      if (idx < colCandies.length) {
        newBoard[row][col] = colCandies[idx]
        idx++
      } else {
        // Fill empty top with new candies
        const newCandy = createCandy()
        newBoard[row][col] = newCandy
        newCandyIds.add(newCandy.id)
        const fallDist = ROWS - row
        falls.push({ candyId: newCandy.id, distance: fallDist })
      }
    }
  }

  return { board: newBoard, falls, newCandyIds }
}

export function hasValidMoves(board: Board): boolean {
  // Check all possible horizontal swaps
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS - 1; col++) {
      if (wouldMatch(board, row, col, row, col + 1)) return true
    }
  }
  // Check all possible vertical swaps
  for (let row = 0; row < ROWS - 1; row++) {
    for (let col = 0; col < COLS; col++) {
      if (wouldMatch(board, row, col, row + 1, col)) return true
    }
  }
  return false
}

function wouldMatch(
  board: Board,
  r1: number,
  c1: number,
  r2: number,
  c2: number,
): boolean {
  if (!board[r1][c1] || !board[r2][c2]) return false

  // Temporarily swap
  const temp: (CandyData | null)[][] = board.map((row) => [...row])
  const t = temp[r1][c1]
  temp[r1][c1] = temp[r2][c2]
  temp[r2][c2] = t

  // Check matches around both positions
  return (
    hasMatchAt(temp, r1, c1) ||
    hasMatchAt(temp, r2, c2)
  )
}

function hasMatchAt(board: (CandyData | null)[][], row: number, col: number): boolean {
  const candy = board[row][col]
  if (!candy) return false

  // Horizontal
  let hCount = 1
  for (let c = col - 1; c >= 0 && board[row][c]?.color === candy.color; c--) hCount++
  for (let c = col + 1; c < COLS && board[row][c]?.color === candy.color; c++) hCount++
  if (hCount >= 3) return true

  // Vertical
  let vCount = 1
  for (let r = row - 1; r >= 0 && board[r][col]?.color === candy.color; r--) vCount++
  for (let r = row + 1; r < ROWS && board[r][col]?.color === candy.color; r++) vCount++
  return vCount >= 3
}
