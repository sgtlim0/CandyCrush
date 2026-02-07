let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

// --- Helpers ---

function createNoise(c: AudioContext, duration: number, vol: number): GainNode {
  const bufSize = c.sampleRate * duration
  const buf = c.createBuffer(1, bufSize, c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < bufSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.5
  }
  const src = c.createBufferSource()
  src.buffer = buf
  const g = c.createGain()
  g.gain.setValueAtTime(vol, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration)
  src.connect(g)
  src.start(c.currentTime)
  src.stop(c.currentTime + duration)
  return g
}

function playNote(
  c: AudioContext,
  freq: number,
  startTime: number,
  dur: number,
  type: OscillatorType,
  vol: number,
  dest: AudioNode,
): void {
  const o = c.createOscillator()
  const g = c.createGain()
  o.connect(g)
  g.connect(dest)
  o.type = type
  o.frequency.setValueAtTime(freq, startTime)
  // Attack-decay envelope
  g.gain.setValueAtTime(0.001, startTime)
  g.gain.linearRampToValueAtTime(vol, startTime + 0.01)
  g.gain.exponentialRampToValueAtTime(0.001, startTime + dur)
  o.start(startTime)
  o.stop(startTime + dur)
}

function playChord(
  c: AudioContext,
  freqs: readonly number[],
  startTime: number,
  dur: number,
  type: OscillatorType,
  vol: number,
  dest: AudioNode,
): void {
  const perVol = vol / freqs.length
  for (const freq of freqs) {
    playNote(c, freq, startTime, dur, type, perVol, dest)
  }
}

// --- Sound Effects ---

/** Soft pop when selecting a candy */
export function playSelect(): void {
  try {
    const c = getCtx()
    const now = c.currentTime
    // Short bright pop
    playNote(c, 880, now, 0.06, 'sine', 0.1, c.destination)
    playNote(c, 1320, now, 0.04, 'sine', 0.06, c.destination)
    // Tiny noise click
    const noise = createNoise(c, 0.03, 0.04)
    const hp = c.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 4000
    noise.connect(hp)
    hp.connect(c.destination)
  } catch { /* ignore */ }
}

/** Whoosh slide when swapping candies */
export function playSwap(): void {
  try {
    const c = getCtx()
    const now = c.currentTime
    // Sliding frequency sweep
    const o = c.createOscillator()
    const g = c.createGain()
    o.connect(g)
    g.connect(c.destination)
    o.type = 'sine'
    o.frequency.setValueAtTime(400, now)
    o.frequency.exponentialRampToValueAtTime(800, now + 0.1)
    g.gain.setValueAtTime(0.12, now)
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.12)
    o.start(now)
    o.stop(now + 0.12)
    // Soft harmonic overlay
    playNote(c, 600, now + 0.02, 0.08, 'triangle', 0.06, c.destination)
  } catch { /* ignore */ }
}

/** Satisfying chime cascade on match - escalates with combo */
export function playMatch(combo: number): void {
  try {
    const c = getCtx()
    const now = c.currentTime

    // Pentatonic scale notes for sweet sound
    const pentatonic = [523, 587, 659, 784, 880, 1047, 1175, 1319, 1568]
    const baseIdx = Math.min(combo * 2, pentatonic.length - 3)
    const root = pentatonic[baseIdx]
    const third = pentatonic[Math.min(baseIdx + 1, pentatonic.length - 1)]
    const fifth = pentatonic[Math.min(baseIdx + 2, pentatonic.length - 1)]

    // Layered chord with stagger for "sparkle" feel
    const vol = Math.min(0.12 + combo * 0.02, 0.22)
    playNote(c, root, now, 0.25, 'sine', vol, c.destination)
    playNote(c, third, now + 0.04, 0.2, 'sine', vol * 0.8, c.destination)
    playNote(c, fifth, now + 0.08, 0.18, 'triangle', vol * 0.6, c.destination)

    // High shimmer
    playNote(c, root * 2, now + 0.02, 0.12, 'sine', vol * 0.3, c.destination)

    // Percussive click
    const noise = createNoise(c, 0.04, 0.06 + combo * 0.01)
    const bp = c.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 3000 + combo * 500
    bp.Q.value = 2
    noise.connect(bp)
    bp.connect(c.destination)
  } catch { /* ignore */ }
}

/** Dull buzz + descend when swap fails */
export function playFail(): void {
  try {
    const c = getCtx()
    const now = c.currentTime
    // Descending minor second
    const o1 = c.createOscillator()
    const g1 = c.createGain()
    o1.connect(g1)
    g1.connect(c.destination)
    o1.type = 'sawtooth'
    o1.frequency.setValueAtTime(300, now)
    o1.frequency.exponentialRampToValueAtTime(200, now + 0.2)
    g1.gain.setValueAtTime(0.08, now)
    g1.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
    o1.start(now)
    o1.stop(now + 0.25)

    // Dissonant overlay
    playNote(c, 190, now + 0.05, 0.18, 'square', 0.04, c.destination)

    // Low thud
    const noise = createNoise(c, 0.08, 0.06)
    const lp = c.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 400
    noise.connect(lp)
    lp.connect(c.destination)
  } catch { /* ignore */ }
}

/** Magical shimmer when special candy is created */
export function playSpecial(): void {
  try {
    const c = getCtx()
    const now = c.currentTime
    // Ascending arpeggio with shimmer
    const notes = [784, 988, 1175, 1568, 1976]
    notes.forEach((freq, i) => {
      const t = now + i * 0.05
      playNote(c, freq, t, 0.2 - i * 0.02, 'sine', 0.1, c.destination)
      // Octave shimmer
      playNote(c, freq * 2, t + 0.01, 0.1, 'sine', 0.04, c.destination)
    })
    // Sparkle noise
    const noise = createNoise(c, 0.15, 0.05)
    const hp = c.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 6000
    noise.connect(hp)
    hp.connect(c.destination)
  } catch { /* ignore */ }
}

/** Big boom for area bomb explosion */
export function playAreaBomb(): void {
  try {
    const c = getCtx()
    const now = c.currentTime
    // Low boom
    const o = c.createOscillator()
    const g = c.createGain()
    o.connect(g)
    g.connect(c.destination)
    o.type = 'sine'
    o.frequency.setValueAtTime(120, now)
    o.frequency.exponentialRampToValueAtTime(40, now + 0.3)
    g.gain.setValueAtTime(0.25, now)
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
    o.start(now)
    o.stop(now + 0.35)
    // Crackle noise burst
    const noise = createNoise(c, 0.2, 0.12)
    const bp = c.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 1500
    bp.Q.value = 0.5
    noise.connect(bp)
    bp.connect(c.destination)
    // Impact sub
    playNote(c, 60, now, 0.25, 'sine', 0.15, c.destination)
  } catch { /* ignore */ }
}

/** Color bomb rainbow cascade */
export function playColorBomb(): void {
  try {
    const c = getCtx()
    const now = c.currentTime
    // Rapid ascending chromatic cascade
    const notes = [523, 622, 740, 880, 1047, 1245, 1480, 1760]
    notes.forEach((freq, i) => {
      const t = now + i * 0.04
      playNote(c, freq, t, 0.15, 'triangle', 0.08, c.destination)
      playNote(c, freq * 1.5, t + 0.02, 0.1, 'sine', 0.04, c.destination)
    })
    // Big sparkle wash
    const noise = createNoise(c, 0.4, 0.06)
    const hp = c.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 5000
    noise.connect(hp)
    hp.connect(c.destination)
  } catch { /* ignore */ }
}

/** Triumphant fanfare on level complete */
export function playLevelUp(): void {
  try {
    const c = getCtx()
    const now = c.currentTime
    // C major fanfare: C-E-G-C (octave)
    const melody: readonly [number, number, number][] = [
      [523, 0, 0.2],
      [659, 0.15, 0.2],
      [784, 0.3, 0.2],
      [1047, 0.45, 0.4],
    ]
    for (const [freq, offset, dur] of melody) {
      const t = now + offset
      playNote(c, freq, t, dur, 'sine', 0.15, c.destination)
      // Harmony fifth above
      playNote(c, freq * 1.5, t + 0.02, dur * 0.7, 'triangle', 0.06, c.destination)
      // Sub octave
      playNote(c, freq * 0.5, t, dur, 'sine', 0.06, c.destination)
    }
    // Final triumphant chord
    playChord(c, [1047, 1319, 1568], now + 0.65, 0.5, 'sine', 0.18, c.destination)
    // Sparkle finish
    const noise = createNoise(c, 0.3, 0.04)
    const hp = c.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 6000
    noise.connect(hp)
    hp.connect(c.destination)
  } catch { /* ignore */ }
}

/** Sad descend on game over */
export function playGameOver(): void {
  try {
    const c = getCtx()
    const now = c.currentTime
    // Descending minor: C-Bb-Ab-G (low)
    const notes: readonly [number, number, number][] = [
      [523, 0, 0.25],
      [466, 0.2, 0.25],
      [415, 0.4, 0.25],
      [392, 0.6, 0.4],
    ]
    for (const [freq, offset, dur] of notes) {
      playNote(c, freq, now + offset, dur, 'sine', 0.12, c.destination)
      playNote(c, freq * 0.5, now + offset, dur, 'triangle', 0.06, c.destination)
    }
  } catch { /* ignore */ }
}

/** Subtle thud when candies land after falling */
export function playLand(count: number): void {
  try {
    const c = getCtx()
    const now = c.currentTime
    const vol = Math.min(0.04 + count * 0.005, 0.1)
    // Soft thump
    const o = c.createOscillator()
    const g = c.createGain()
    o.connect(g)
    g.connect(c.destination)
    o.type = 'sine'
    o.frequency.setValueAtTime(150, now)
    o.frequency.exponentialRampToValueAtTime(60, now + 0.06)
    g.gain.setValueAtTime(vol, now)
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.08)
    o.start(now)
    o.stop(now + 0.08)
    // Click
    const noise = createNoise(c, 0.03, vol * 0.5)
    const lp = c.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 2000
    noise.connect(lp)
    lp.connect(c.destination)
  } catch { /* ignore */ }
}

/** Combo escalation sound - plays on top of match */
export function playCombo(level: number): void {
  try {
    const c = getCtx()
    const now = c.currentTime
    // Rising pitch based on combo level
    const base = 800 + level * 150
    playNote(c, base, now, 0.15, 'sine', 0.1, c.destination)
    playNote(c, base * 1.25, now + 0.05, 0.12, 'triangle', 0.07, c.destination)
    playNote(c, base * 1.5, now + 0.1, 0.1, 'sine', 0.05, c.destination)
  } catch { /* ignore */ }
}
