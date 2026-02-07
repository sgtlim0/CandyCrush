let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

function tone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.2): void {
  try {
    const c = getCtx()
    const o = c.createOscillator()
    const g = c.createGain()
    o.connect(g)
    g.connect(c.destination)
    o.type = type
    o.frequency.setValueAtTime(freq, c.currentTime)
    g.gain.setValueAtTime(vol, c.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur)
    o.start(c.currentTime)
    o.stop(c.currentTime + dur)
  } catch { /* ignore */ }
}

export function playSwap(): void {
  tone(500, 0.08, 'sine', 0.15)
}

export function playMatch(combo: number): void {
  const baseFreq = 523 + combo * 80
  const c = getCtx()
  const now = c.currentTime
  ;[0, 0.08, 0.16].forEach((offset, i) => {
    const o = c.createOscillator()
    const g = c.createGain()
    o.connect(g)
    g.connect(c.destination)
    o.type = 'sine'
    o.frequency.setValueAtTime(baseFreq + i * 100, now + offset)
    g.gain.setValueAtTime(0.15, now + offset)
    g.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.2)
    o.start(now + offset)
    o.stop(now + offset + 0.2)
  })
}

export function playFail(): void {
  tone(200, 0.15, 'sawtooth', 0.1)
  setTimeout(() => tone(160, 0.2, 'sawtooth', 0.1), 100)
}

export function playLevelUp(): void {
  const c = getCtx()
  const now = c.currentTime
  const notes = [523, 659, 784, 1047]
  notes.forEach((freq, i) => {
    const o = c.createOscillator()
    const g = c.createGain()
    o.connect(g)
    g.connect(c.destination)
    o.type = 'sine'
    o.frequency.setValueAtTime(freq, now + i * 0.12)
    g.gain.setValueAtTime(0.2, now + i * 0.12)
    g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.3)
    o.start(now + i * 0.12)
    o.stop(now + i * 0.12 + 0.3)
  })
}

export function playSpecial(): void {
  const c = getCtx()
  const now = c.currentTime
  ;[800, 1000, 1200, 1600].forEach((freq, i) => {
    const o = c.createOscillator()
    const g = c.createGain()
    o.connect(g)
    g.connect(c.destination)
    o.type = 'triangle'
    o.frequency.setValueAtTime(freq, now + i * 0.06)
    g.gain.setValueAtTime(0.12, now + i * 0.06)
    g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.15)
    o.start(now + i * 0.06)
    o.stop(now + i * 0.06 + 0.15)
  })
}
