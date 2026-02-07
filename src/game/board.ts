import type { Board, CandyData, CandyColor, Position } from './types'
import { ROWS, COLS, CANDY_COLORS } from './constants'

let _nextId = 0

export function resetIdCounter(): void {
  _nextId = 0
}

export function nextId(): number {
  _nextId += 1
  return _nextId
}

function randomColor(): CandyColor {
  return CANDY_COLORS[Math.floor(Math.random() * CANDY_COLORS.length)]
}

export function createCandy(color?: CandyColor): CandyData {
  return {
    id: nextId(),
    color: color ?? randomColor(),
    special: null,
  }
}

export function createBoard(): Board {
  const board: (CandyData | null)[][] = []

  for (let row = 0; row < ROWS; row++) {
    const rowArr: (CandyData | null)[] = []
    for (let col = 0; col < COLS; col++) {
      let candy = createCandy()

      // Avoid creating initial matches
      while (
        (col >= 2 &&
          rowArr[col - 1]?.color === candy.color &&
          rowArr[col - 2]?.color === candy.color) ||
        (row >= 2 &&
          board[row - 1]?.[col]?.color === candy.color &&
          board[row - 2]?.[col]?.color === candy.color)
      ) {
        candy = createCandy()
      }

      rowArr.push(candy)
    }
    board.push(rowArr)
  }

  return board
}

export function isValidPosition(pos: Position): boolean {
  return pos.row >= 0 && pos.row < ROWS && pos.col >= 0 && pos.col < COLS
}

export function areAdjacent(a: Position, b: Position): boolean {
  const dr = Math.abs(a.row - b.row)
  const dc = Math.abs(a.col - b.col)
  return (dr === 1 && dc === 0) || (dr === 0 && dc === 1)
}

export function swapInBoard(board: Board, a: Position, b: Position): Board {
  const newBoard = board.map((row) => [...row])
  const temp = newBoard[a.row][a.col]
  newBoard[a.row][a.col] = newBoard[b.row][b.col]
  newBoard[b.row][b.col] = temp
  return newBoard
}

export function posKey(row: number, col: number): string {
  return `${row},${col}`
}
