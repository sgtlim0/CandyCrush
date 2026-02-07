import styles from './StartScreen.module.css'

interface StartScreenProps {
  readonly onStart: () => void
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.candies}>
          {['#ff6b6b', '#ffa726', '#ffee58', '#66bb6a', '#42a5f5', '#ab47bc'].map(
            (color, i) => (
              <div
                key={i}
                className={styles.floatingCandy}
                style={{
                  background: `radial-gradient(circle at 35% 30%, ${color}, ${color}88)`,
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ),
          )}
        </div>
        <h1 className={styles.title}>CANDY CRUSH</h1>
        <p className={styles.subtitle}>Match 3 Puzzle Game</p>
      </div>

      <div className={styles.rules}>
        <div className={styles.rule}>
          <span className={styles.ruleIcon}>&#x1F447;</span>
          <p>인접한 캔디를 스와이프하거나 탭하여 교환</p>
        </div>
        <div className={styles.rule}>
          <span className={styles.ruleIcon}>&#x2728;</span>
          <p>같은 색 캔디 3개 이상을 일렬로 매치</p>
        </div>
        <div className={styles.rule}>
          <span className={styles.ruleIcon}>&#x1F31F;</span>
          <p>4개 매치 = 줄무늬, 5개 매치 = 컬러 폭탄</p>
        </div>
        <div className={styles.rule}>
          <span className={styles.ruleIcon}>&#x1F3AF;</span>
          <p>제한된 이동 횟수 안에 목표 점수 달성!</p>
        </div>
      </div>

      <button className={styles.startBtn} onClick={onStart} type="button">
        PLAY
      </button>
    </div>
  )
}
