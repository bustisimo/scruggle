/**
 * AudioManager — Web Audio API sound effects for Scruggle.
 * Singleton. Synthesizes all sounds (no external files).
 */

let instance = null;

export class AudioManager {
  constructor() {
    if (instance) return instance;
    /** @type {AudioContext|null} */
    this._ctx = null;
    this._muted = false;
    instance = this;
  }

  /** @returns {AudioContext} */
  _ctx_ensure() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume if suspended (browser autoplay policy)
    if (this._ctx.state === 'suspended') {
      this._ctx.resume().catch(() => {});
    }
    return this._ctx;
  }

  get muted() { return this._muted; }

  /** Toggle mute. Returns new mute state. */
  toggle() {
    this._muted = !this._muted;
    return this._muted;
  }

  /** Set mute explicitly. */
  setMute(v) { this._muted = !!v; }

  // ─── helpers ────────────────────────────────────────

  /**
   * Play a tone (or chord) with ADSR envelope.
   * @param {number[]} freqs  — frequencies in Hz
   * @param {object} opts
   * @param {number} [opts.duration=0.15]
   * @param {number} [opts.type='sine']
   * @param {number} [opts.volume=0.15]
   * @param {number} [opts.attack=0.005]
   * @param {number} [opts.decay=0.02]
   * @param {number} [opts.sustain=0.3]
   * @param {number} [opts.release=0.05]
   */
  _playTones(freqs, opts = {}) {
    if (this._muted) return;
    const ctx = this._ctx_ensure();
    const {
      duration = 0.15,
      type = 'sine',
      volume = 0.15,
      attack = 0.005,
      decay = 0.02,
      sustain = 0.3,
      release = 0.05,
    } = opts;

    const now = ctx.currentTime;

    for (const freq of freqs) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.value = freq;

      // ADSR envelope
      const total = attack + decay + duration + release;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume, now + attack);
      gain.gain.linearRampToValueAtTime(volume * sustain, now + attack + decay);
      gain.gain.setValueAtTime(volume * sustain, now + attack + decay + duration);
      gain.gain.linearRampToValueAtTime(0, now + total);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + total + 0.01);
    }
  }

  /**
   * Play noise burst (buzz, explosion).
   * @param {object} opts
   */
  _playNoise(opts = {}) {
    if (this._muted) return;
    const ctx = this._ctx_ensure();
    const {
      duration = 0.3,
      volume = 0.1,
      type = 'brown',
    } = opts;

    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      let v;
      if (type === 'white') {
        v = Math.random() * 2 - 1;
      } else if (type === 'pink') {
        // pink noise approximation: accumulate
        v = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      } else {
        // brown: integrate white noise
        v = (Math.random() * 2 - 1) * 0.1;
        if (i > 0) v += data[i - 1] * 0.9;
      }
      data[i] = v;
    }

    const src = ctx.createBufferSource();
    src.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    // Low-pass filter for buzzy feel
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 300;

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start();
  }

  // ─── public sound triggers ──────────────────────────

  /** Tile placement — short click/pop */
  tilePlace() {
    this._playTones([800], {
      duration: 0.04,
      type: 'sine',
      volume: 0.08,
      attack: 0.002,
      decay: 0.005,
      sustain: 0.1,
      release: 0.01,
    });
  }

  /** Word submitted successfully — ascending chime (C-E-G arpeggio) */
  wordSubmit() {
    const now = this._ctx_ensure().currentTime;
    if (this._muted) return;

    // Schedule arpeggio notes manually for timing
    const ctx = this._ctx_ensure();
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    const baseVol = 0.12;
    const spacing = 0.07;

    for (let i = 0; i < notes.length; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = notes[i];

      const start = now + i * spacing;
      const dur = 0.15;

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(baseVol, start + 0.005);
      gain.gain.setValueAtTime(baseVol, start + dur - 0.02);
      gain.gain.linearRampToValueAtTime(0, start + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur + 0.01);
    }
  }

  /** Invalid word — low buzz */
  invalidWord() {
    this._playNoise({ duration: 0.4, volume: 0.08, type: 'brown' });
    this._playTones([110], {
      duration: 0.35,
      type: 'sawtooth',
      volume: 0.06,
      attack: 0.01,
      decay: 0.05,
      sustain: 0.5,
      release: 0.15,
    });
  }

  /** Gold earned — coin / ding */
  goldEarned() {
    const ctx = this._ctx_ensure();
    if (this._muted) return;
    const now = ctx.currentTime;

    // Two quick metallic pings
    const pings = [1800, 2400];
    for (let i = 0; i < pings.length; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = pings[i];

      const start = now + i * 0.06;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.1, start + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.15);
    }
  }

  /** Achievement unlocked — fanfare (C-E-G-C arpeggio, brighter) */
  achievementUnlock() {
    const ctx = this._ctx_ensure();
    if (this._muted) return;
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const baseVol = 0.14;
    const spacing = 0.08;

    for (let i = 0; i < notes.length; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = notes[i];

      const start = now + i * spacing;
      const dur = 0.3;

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(baseVol, start + 0.005);
      gain.gain.setValueAtTime(baseVol, start + dur - 0.05);
      gain.gain.linearRampToValueAtTime(0, start + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur + 0.01);
    }

    // Sparkly top note
    setTimeout(() => {
      if (this._muted) return;
      const ctx2 = this._ctx_ensure();
      const now2 = ctx2.currentTime;
      const osc = ctx2.createOscillator();
      const gain = ctx2.createGain();
      osc.type = 'sine';
      osc.frequency.value = 1318.5; // E6
      gain.gain.setValueAtTime(0, now2);
      gain.gain.linearRampToValueAtTime(0.08, now2 + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, now2 + 0.6);
      osc.connect(gain);
      gain.connect(ctx2.destination);
      osc.start(now2);
      osc.stop(now2 + 0.7);
    }, notes.length * spacing * 1000 + 100);
  }

  /** Round won — celebration chord + rising arpeggio */
  roundWin() {
    const ctx = this._ctx_ensure();
    if (this._muted) return;
    const now = ctx.currentTime;

    // Grand chord: C major 7th
    const chord = [523.25, 659.25, 783.99, 987.77]; // C5 E5 G5 B5
    for (const freq of chord) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.01);
      gain.gain.setValueAtTime(0.1, now + 0.4);
      gain.gain.linearRampToValueAtTime(0, now + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.0);
    }
  }

  /** Round lost — sad trombone descending slide */
  roundLoss() {
    const ctx = this._ctx_ensure();
    if (this._muted) return;
    const now = ctx.currentTime;

    // Descending slide on sawtooth
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.linearRampToValueAtTime(100, now + 0.6);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.01);
    gain.gain.setValueAtTime(0.08, now + 0.5);
    gain.gain.linearRampToValueAtTime(0, now + 0.9);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.0);
  }
}

/** Singleton export */
export const audio = new AudioManager();
export default audio;