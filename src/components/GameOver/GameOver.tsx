import styles from './GameOver.module.css'

interface GameOverProps {
  readonly level: number
  readonly score: number
  readonly targetScore: number
  readonly onRetry: () => void
  readonly onMenu: () => void
}

export function GameOver({ level, score, targetScore, onRetry, onMenu }: GameOverProps) {
  const progress = Math.round((score / targetScore) * 100)

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.icon}>&#x1F614;</div>
        <h2 className={styles.title}>GAME OVER</h2>
        <p className={styles.levelInfo}>Level {level}</p>
        <div className={styles.scoreBox}>
          <span className={styles.scoreValue}>{score.toLocaleString()}</span>
          <span className={styles.scoreTarget}>/ {targetScore.toLocaleString()}</span>
        </div>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <p className={styles.progressText}>{progress}% 달성</p>
        <button className={styles.retryBtn} onClick={onRetry} type="button">
          RETRY
        </button>
        <button className={styles.menuBtn} onClick={onMenu} type="button">
          MENU
        </button>
      </div>
    </div>
  )
}
