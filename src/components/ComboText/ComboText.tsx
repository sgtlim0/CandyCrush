import type { ComboMessage } from '../../game/types'
import styles from './ComboText.module.css'

interface ComboTextProps {
  readonly messages: readonly ComboMessage[]
}

export function ComboText({ messages }: ComboTextProps) {
  if (messages.length === 0) return null

  return (
    <div className={styles.container}>
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={styles.combo}
          style={{
            left: `${(msg.col + 0.5) * 12.5}%`,
            top: `${(msg.row + 0.5) * 12.5}%`,
          }}
        >
          {msg.text}
        </div>
      ))}
    </div>
  )
}
