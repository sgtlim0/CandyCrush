import { memo } from 'react'
import type { CandyData, FallInfo } from '../../game/types'
import { CANDY_EMOJI, COLOR_MAP, ANIM_FALL } from '../../game/constants'
import styles from './CandyCell.module.css'

interface CandyCellProps {
  readonly candy: CandyData
  readonly row: number
  readonly col: number
  readonly isSelected: boolean
  readonly isMatched: boolean
  readonly isNew: boolean
  readonly isHint: boolean
  readonly fallInfo: FallInfo | undefined
  readonly onClick: () => void
}

export const CandyCell = memo(function CandyCell({
  candy,
  row,
  col,
  isSelected,
  isMatched,
  isNew,
  isHint,
  fallInfo,
  onClick,
}: CandyCellProps) {
  const colors = COLOR_MAP[candy.color]

  const classList = [
    styles.candy,
    isSelected ? styles.selected : '',
    isMatched ? styles.matched : '',
    fallInfo || isNew ? styles.falling : '',
    isHint ? styles.hint : '',
    candy.special === 'striped-h' ? styles.stripedH : '',
    candy.special === 'striped-v' ? styles.stripedV : '',
    candy.special === 'area-bomb' ? styles.areaBomb : '',
    candy.special === 'color-bomb' ? styles.colorBomb : '',
  ]
    .filter(Boolean)
    .join(' ')

  const fallDistance = fallInfo ? fallInfo.distance * 12.5 : 0
  const fallDuration = fallInfo ? Math.min(ANIM_FALL, 150 + fallInfo.distance * 30) : ANIM_FALL

  const isColorBomb = candy.special === 'color-bomb'

  return (
    <div
      className={classList}
      style={{
        top: `calc(${row * 12.5}% + 2px)`,
        left: `calc(${col * 12.5}% + 2px)`,
        background: isColorBomb
          ? 'conic-gradient(from 0deg, #ff6b6b, #ffa726, #ffee58, #66bb6a, #42a5f5, #ab47bc, #ff6b6b)'
          : `radial-gradient(circle at 40% 35%, ${colors.light}44, ${colors.dark}66)`,
        '--fall-distance': `${fallDistance}%`,
        '--fall-duration': `${fallDuration}ms`,
      } as React.CSSProperties}
      onClick={onClick}
    >
      <span className={styles.emoji}>
        {isColorBomb ? '🌈' : CANDY_EMOJI[candy.color]}
      </span>
      {candy.special === 'striped-h' && <div className={styles.stripeOverlayH} />}
      {candy.special === 'striped-v' && <div className={styles.stripeOverlayV} />}
      {candy.special === 'area-bomb' && <div className={styles.bombRing} />}
    </div>
  )
})
