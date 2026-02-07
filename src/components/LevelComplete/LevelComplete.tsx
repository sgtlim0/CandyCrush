import { LEVELS } from '../../game/constants'
import styles from './LevelComplete.module.css'

interface LevelCompleteProps {
  readonly level: number
  readonly score: number
  readonly onNext: () => void
  readonly onMenu: () => void
}

export function LevelComplete({ level, score, onNext, onMenu }: LevelCompleteProps) {
  const isLastLevel = level >= LEVELS.length

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.stars}>
          <span className={styles.star} style={{ animationDelay: '0s' }}>&#9733;</span>
          <span className={`${styles.star} ${styles.starBig}`} style={{ animationDelay: '0.2s' }}>&#9733;</span>
          <span className={styles.star} style={{ animationDelay: '0.4s' }}>&#9733;</span>
        </div>
        <h2 className={styles.title}>
          {isLastLevel ? 'ALL CLEAR!' : 'LEVEL COMPLETE!'}
        </h2>
        <div className={styles.scoreBox}>
          <span className={styles.scoreLabel}>SCORE</span>
          <span className={styles.scoreValue}>{score.toLocaleString()}</span>
        </div>
        {!isLastLevel && (
          <button className={styles.nextBtn} onClick={onNext} type="button">
            LEVEL {level + 1}
          </button>
        )}
        <button className={styles.menuBtn} onClick={onMenu} type="button">
          {isLastLevel ? 'PLAY AGAIN' : 'MENU'}
        </button>
      </div>
    </div>
  )
}
