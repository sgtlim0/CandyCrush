import { CANDY_EMOJI, CANDY_COLORS } from '../../game/constants'
import styles from './StartScreen.module.css'

interface StartScreenProps {
  readonly onStart: () => void
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.candies}>
          {CANDY_COLORS.map((color, i) => (
            <div
              key={color}
              className={styles.floatingCandy}
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              {CANDY_EMOJI[color]}
            </div>
          ))}
        </div>
        <h1 className={styles.title}>CANDY CRUSH</h1>
        <p className={styles.subtitle}>Match 3 Puzzle Game</p>
      </div>

      <div className={styles.rules}>
        <div className={styles.rule}>
          <span className={styles.ruleIcon}>&#x1F447;</span>
          <p>Swipe or tap adjacent candies to swap</p>
        </div>
        <div className={styles.rule}>
          <span className={styles.ruleIcon}>&#x2728;</span>
          <p>Match 3+ same candies in a line</p>
        </div>
        <div className={styles.rule}>
          <span className={styles.ruleIcon}>&#x1F31F;</span>
          <p>4-match = Striped, T/L = Bomb, 5 = Rainbow</p>
        </div>
        <div className={styles.rule}>
          <span className={styles.ruleIcon}>&#x1F3AF;</span>
          <p>Reach the target score within limited moves!</p>
        </div>
      </div>

      <button className={styles.startBtn} onClick={onStart} type="button">
        PLAY
      </button>
    </div>
  )
}
