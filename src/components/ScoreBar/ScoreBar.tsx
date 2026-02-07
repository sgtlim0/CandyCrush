import styles from './ScoreBar.module.css'

interface ScoreBarProps {
  readonly level: number
  readonly score: number
  readonly targetScore: number
  readonly movesLeft: number
  readonly combo: number
}

export function ScoreBar({ level, score, targetScore, movesLeft, combo }: ScoreBarProps) {
  const progress = Math.min((score / targetScore) * 100, 100)

  return (
    <div className={styles.container}>
      <div className={styles.topRow}>
        <div className={styles.levelBadge}>
          <span className={styles.levelLabel}>LEVEL</span>
          <span className={styles.levelValue}>{level}</span>
        </div>
        <div className={styles.scoreSection}>
          <span className={styles.scoreValue}>{score.toLocaleString()}</span>
          <span className={styles.scoreTarget}>/ {targetScore.toLocaleString()}</span>
        </div>
        <div className={styles.movesSection}>
          <span className={styles.movesValue}>{movesLeft}</span>
          <span className={styles.movesLabel}>MOVES</span>
        </div>
      </div>
      <div className={styles.progressTrack}>
        <div
          className={styles.progressFill}
          style={{ width: `${progress}%` }}
        />
      </div>
      {combo > 1 && (
        <div className={styles.combo}>
          COMBO x{combo}!
        </div>
      )}
    </div>
  )
}
