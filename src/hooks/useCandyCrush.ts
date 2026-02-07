import { useState, useCallback, useRef, useEffect } from 'react'
import type { Board, GamePhase, Position, FallInfo } from '../game/types'
import { LEVELS, ANIM_SWAP, ANIM_REMOVE, ANIM_FALL, POINTS_BASE, POINTS_FOUR, POINTS_FIVE, COMBO_MULTIPLIER } from '../game/constants'
import { createBoard, areAdjacent, swapInBoard, resetIdCounter } from '../game/board'
import { findMatches, getMatchedPositions, determineSpecials, activateSpecials } from '../game/matcher'
import { applyGravityAndFill, hasValidMoves } from '../game/gravity'
import { playSwap, playMatch, playFail, playLevelUp, playSpecial } from '../utils/sound'

export interface CandyCrushState {
  readonly board: Board
  readonly phase: GamePhase
  readonly selected: Position | null
  readonly score: number
  readonly movesLeft: number
  readonly targetScore: number
  readonly level: number
  readonly combo: number
  readonly matchedKeys: ReadonlySet<string>
  readonly falls: readonly FallInfo[]
  readonly newCandyIds: ReadonlySet<number>
  readonly swapPair: readonly [Position, Position] | null
}

export interface CandyCrushActions {
  readonly startGame: () => void
  readonly selectCandy: (pos: Position) => void
  readonly nextLevel: () => void
  readonly restartLevel: () => void
  readonly resetGame: () => void
}

function calcPoints(matchLen: number, combo: number): number {
  let base = POINTS_BASE * matchLen
  if (matchLen === 4) base = POINTS_FOUR * matchLen
  if (matchLen >= 5) base = POINTS_FIVE * matchLen
  return Math.floor(base * Math.pow(COMBO_MULTIPLIER, combo))
}

export function useCandyCrush(): CandyCrushState & CandyCrushActions {
  const [board, setBoard] = useState<Board>([])
  const [phase, setPhase] = useState<GamePhase>('start')
  const [selected, setSelected] = useState<Position | null>(null)
  const [score, setScore] = useState(0)
  const [movesLeft, setMovesLeft] = useState(30)
  const [level, setLevel] = useState(1)
  const [combo, setCombo] = useState(0)
  const [matchedKeys, setMatchedKeys] = useState<ReadonlySet<string>>(new Set())
  const [falls, setFalls] = useState<readonly FallInfo[]>([])
  const [newCandyIds, setNewCandyIds] = useState<ReadonlySet<number>>(new Set())
  const [swapPair, setSwapPair] = useState<readonly [Position, Position] | null>(null)

  const phaseRef = useRef(phase)
  const boardRef = useRef(board)
  const comboRef = useRef(combo)
  const scoreRef = useRef(score)
  const movesRef = useRef(movesLeft)
  const levelRef = useRef(level)

  useEffect(() => { phaseRef.current = phase }, [phase])
  useEffect(() => { boardRef.current = board }, [board])
  useEffect(() => { comboRef.current = combo }, [combo])
  useEffect(() => { scoreRef.current = score }, [score])
  useEffect(() => { movesRef.current = movesLeft }, [movesLeft])
  useEffect(() => { levelRef.current = level }, [level])

  const getLevelConfig = useCallback(() => {
    return LEVELS[Math.min(levelRef.current - 1, LEVELS.length - 1)]
  }, [])

  type ProcessFn = (board: Board, combo: number, swapPos?: Position) => void
  const processRef = useRef<ProcessFn>(() => {})

  const processMatches = useCallback((currentBoard: Board, currentCombo: number, swapPos?: Position) => {
    const matches = findMatches(currentBoard)
    if (matches.length === 0) {
      setCombo(0)
      setPhase('idle')

      // Check win/lose
      if (scoreRef.current >= getLevelConfig().targetScore) {
        playLevelUp()
        setPhase('levelComplete')
      } else if (movesRef.current <= 0) {
        setPhase('gameOver')
      } else if (!hasValidMoves(currentBoard)) {
        resetIdCounter()
        const newBoard = createBoard()
        setBoard(newBoard)
      }
      return
    }

    // Calculate score
    let matchPoints = 0
    for (const match of matches) {
      matchPoints += calcPoints(match.positions.length, currentCombo)
    }
    setScore((prev) => prev + matchPoints)

    // Find matched positions and activate specials
    let matched = getMatchedPositions(matches)
    matched = activateSpecials(currentBoard, matched)

    const specials = determineSpecials(currentBoard, matches, swapPos)
    if (specials.length > 0) playSpecial()

    playMatch(currentCombo)
    setMatchedKeys(matched)
    setPhase('removing')

    setTimeout(() => {
      const result = applyGravityAndFill(currentBoard, matched, specials)
      setBoard(result.board)
      setFalls(result.falls)
      setNewCandyIds(result.newCandyIds)
      setMatchedKeys(new Set())
      setPhase('falling')

      const nextCombo = currentCombo + 1
      setCombo(nextCombo)

      setTimeout(() => {
        setFalls([])
        setNewCandyIds(new Set())
        processRef.current(result.board, nextCombo)
      }, ANIM_FALL)
    }, ANIM_REMOVE)
  }, [getLevelConfig])

  useEffect(() => { processRef.current = processMatches }, [processMatches])

  const handleSwap = useCallback((from: Position, to: Position) => {
    const swapped = swapInBoard(boardRef.current, from, to)
    const matches = findMatches(swapped)

    playSwap()
    setBoard(swapped)
    setSwapPair([from, to])
    setPhase('swapping')

    if (matches.length === 0) {
      // No match - swap back
      setTimeout(() => {
        playFail()
        setBoard(swapInBoard(swapped, from, to))
        setSwapPair(null)
        setPhase('idle')
      }, ANIM_SWAP)
    } else {
      // Valid swap
      setTimeout(() => {
        setSwapPair(null)
        setMovesLeft((prev) => prev - 1)
        processMatches(swapped, 0, from)
      }, ANIM_SWAP)
    }
  }, [processMatches])

  const selectCandy = useCallback((pos: Position) => {
    if (phaseRef.current !== 'idle') return

    if (selected === null) {
      setSelected(pos)
      return
    }

    if (pos.row === selected.row && pos.col === selected.col) {
      setSelected(null)
      return
    }

    if (areAdjacent(selected, pos)) {
      setSelected(null)
      handleSwap(selected, pos)
    } else {
      setSelected(pos)
    }
  }, [selected, handleSwap])

  const startGame = useCallback(() => {
    resetIdCounter()
    const newBoard = createBoard()
    const config = LEVELS[0]
    setBoard(newBoard)
    setScore(0)
    setMovesLeft(config.moves)
    setLevel(1)
    setCombo(0)
    setSelected(null)
    setMatchedKeys(new Set())
    setFalls([])
    setNewCandyIds(new Set())
    setSwapPair(null)
    setPhase('idle')
  }, [])

  const nextLevel = useCallback(() => {
    const nextLvl = level + 1
    if (nextLvl > LEVELS.length) {
      setPhase('start')
      return
    }
    resetIdCounter()
    const newBoard = createBoard()
    const config = LEVELS[nextLvl - 1]
    setBoard(newBoard)
    setScore(0)
    setMovesLeft(config.moves)
    setLevel(nextLvl)
    setCombo(0)
    setSelected(null)
    setMatchedKeys(new Set())
    setFalls([])
    setNewCandyIds(new Set())
    setSwapPair(null)
    setPhase('idle')
  }, [level])

  const restartLevel = useCallback(() => {
    resetIdCounter()
    const newBoard = createBoard()
    const config = getLevelConfig()
    setBoard(newBoard)
    setScore(0)
    setMovesLeft(config.moves)
    setCombo(0)
    setSelected(null)
    setMatchedKeys(new Set())
    setFalls([])
    setNewCandyIds(new Set())
    setSwapPair(null)
    setPhase('idle')
  }, [getLevelConfig])

  const resetGame = useCallback(() => {
    setPhase('start')
  }, [])

  return {
    board,
    phase,
    selected,
    score,
    movesLeft,
    targetScore: LEVELS[Math.min(level - 1, LEVELS.length - 1)].targetScore,
    level,
    combo,
    matchedKeys,
    falls,
    newCandyIds,
    swapPair,
    startGame,
    selectCandy,
    nextLevel,
    restartLevel,
    resetGame,
  }
}
