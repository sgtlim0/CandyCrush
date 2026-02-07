import { useCallback, useRef } from 'react'
import type { Board as BoardType, Position, FallInfo, ComboMessage, ParticleGroup } from '../../game/types'
import { ROWS, COLS } from '../../game/constants'
import { CandyCell } from '../CandyCell/CandyCell'
import { ComboText } from '../ComboText/ComboText'
import { Particles } from '../Particles/Particles'
import styles from './Board.module.css'

interface BoardProps {
  readonly board: BoardType
  readonly selected: Position | null
  readonly matchedKeys: ReadonlySet<string>
  readonly falls: readonly FallInfo[]
  readonly newCandyIds: ReadonlySet<number>
  readonly hintPositions: readonly Position[]
  readonly comboMessages: readonly ComboMessage[]
  readonly particles: readonly ParticleGroup[]
  readonly onSelect: (pos: Position) => void
  readonly disabled: boolean
}

export function Board({
  board,
  selected,
  matchedKeys,
  falls,
  newCandyIds,
  hintPositions,
  comboMessages,
  particles,
  onSelect,
  disabled,
}: BoardProps) {
  const boardRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef<{ x: number; y: number; pos: Position } | null>(null)

  const fallMap = new Map<number, FallInfo>()
  for (const f of falls) {
    fallMap.set(f.candyId, f)
  }

  const hintSet = new Set<string>()
  for (const hp of hintPositions) {
    hintSet.add(`${hp.row},${hp.col}`)
  }

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled) return
      const touch = e.touches[0]
      const rect = boardRef.current?.getBoundingClientRect()
      if (!rect) return

      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top
      const col = Math.floor((x / rect.width) * COLS)
      const row = Math.floor((y / rect.height) * ROWS)

      if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
        touchStartRef.current = { x: touch.clientX, y: touch.clientY, pos: { row, col } }
      }
    },
    [disabled],
  )

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (disabled || !touchStartRef.current) return
      const touch = e.changedTouches[0]
      const start = touchStartRef.current
      const dx = touch.clientX - start.x
      const dy = touch.clientY - start.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < 15) {
        onSelect(start.pos)
      } else {
        let targetPos: Position
        if (Math.abs(dx) > Math.abs(dy)) {
          targetPos = { row: start.pos.row, col: start.pos.col + (dx > 0 ? 1 : -1) }
        } else {
          targetPos = { row: start.pos.row + (dy > 0 ? 1 : -1), col: start.pos.col }
        }

        if (targetPos.row >= 0 && targetPos.row < ROWS && targetPos.col >= 0 && targetPos.col < COLS) {
          onSelect(start.pos)
          setTimeout(() => onSelect(targetPos), 10)
        }
      }
      touchStartRef.current = null
    },
    [disabled, onSelect],
  )

  const gridCells = []
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      gridCells.push(
        <div
          key={`bg-${row}-${col}`}
          className={`${styles.cell} ${(row + col) % 2 === 0 ? styles.cellLight : styles.cellDark}`}
          style={{
            top: `${row * 12.5}%`,
            left: `${col * 12.5}%`,
          }}
        />,
      )
    }
  }

  const candies = []
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const candy = board[row]?.[col]
      if (!candy) continue

      const isSelected =
        selected !== null && selected.row === row && selected.col === col
      const isMatched = matchedKeys.has(`${row},${col}`)
      const isNew = newCandyIds.has(candy.id)
      const isHint = hintSet.has(`${row},${col}`)
      const fi = fallMap.get(candy.id)

      candies.push(
        <CandyCell
          key={candy.id}
          candy={candy}
          row={row}
          col={col}
          isSelected={isSelected}
          isMatched={isMatched}
          isNew={isNew}
          isHint={isHint}
          fallInfo={fi}
          onClick={() => !disabled && onSelect({ row, col })}
        />,
      )
    }
  }

  return (
    <div
      ref={boardRef}
      className={styles.board}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {gridCells}
      {candies}
      <Particles groups={particles} />
      <ComboText messages={comboMessages} />
    </div>
  )
}
