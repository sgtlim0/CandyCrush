import type { ParticleGroup } from '../../game/types'
import { COLOR_MAP } from '../../game/constants'
import styles from './Particles.module.css'

interface ParticlesProps {
  readonly groups: readonly ParticleGroup[]
}

const PARTICLE_COUNT = 8

export function Particles({ groups }: ParticlesProps) {
  if (groups.length === 0) return null

  return (
    <div className={styles.container}>
      {groups.map((g) => {
        const color = COLOR_MAP[g.color].light
        return (
          <div
            key={g.id}
            className={styles.group}
            style={{
              left: `${g.col * 12.5}%`,
              top: `${g.row * 12.5}%`,
            }}
          >
            {Array.from({ length: PARTICLE_COUNT }, (_, i) => (
              <div
                key={i}
                className={styles.particle}
                style={{ background: color }}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}
