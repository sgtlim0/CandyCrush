import { useCandyCrush } from './hooks/useCandyCrush'
import { StartScreen } from './components/StartScreen/StartScreen'
import { Board } from './components/Board/Board'
import { ScoreBar } from './components/ScoreBar/ScoreBar'
import { LevelComplete } from './components/LevelComplete/LevelComplete'
import { GameOver } from './components/GameOver/GameOver'
import styles from './App.module.css'

export default function App() {
  const game = useCandyCrush()

  if (game.phase === 'start') {
    return (
      <div className={styles.app}>
        <StartScreen onStart={game.startGame} />
      </div>
    )
  }

  const isPlaying = game.phase === 'idle'
  const isBusy = !isPlaying

  return (
    <div className={styles.app}>
      <div className={styles.gameArea}>
        <ScoreBar
          level={game.level}
          score={game.score}
          targetScore={game.targetScore}
          movesLeft={game.movesLeft}
          combo={game.combo}
        />
        <Board
          board={game.board}
          selected={game.selected}
          matchedKeys={game.matchedKeys}
          falls={game.falls}
          newCandyIds={game.newCandyIds}
          onSelect={game.selectCandy}
          disabled={isBusy}
        />
      </div>

      {game.phase === 'levelComplete' && (
        <LevelComplete
          level={game.level}
          score={game.score}
          onNext={game.nextLevel}
          onMenu={game.resetGame}
        />
      )}

      {game.phase === 'gameOver' && (
        <GameOver
          level={game.level}
          score={game.score}
          targetScore={game.targetScore}
          onRetry={game.restartLevel}
          onMenu={game.resetGame}
        />
      )}
    </div>
  )
}
