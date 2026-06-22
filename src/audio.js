/**
 * AudioManager — lightweight synthesized sound effects via Web Audio API.
 * Singleton. No external files required. All sounds are procedurally generated.
 */
class AudioManager {
    constructor() {
        if (AudioManager._instance) return AudioManager._instance;
        AudioManager._instance = this;

        this._ctx = null;
        this._muted = false;

        // Restore mute preference
        try {
            this._muted = localStorage.getItem('scruggle_muted') === 'true';
        } catch (_) { /* localStorage unavailable */ }

        // Bind so we can pass references
        this.tilePlace = this.tilePlace.bind(this);
        this.wordSubmit = this.wordSubmit.bind(this);
        this.invalidWord = this.invalidWord.bind(this);
        this.goldEarned = this.goldEarned.bind(this);
        this.achievementUnlock = this.achievementUnlock.bind(this);
        this.roundWin = this.roundWin.bind(this);
        this.roundLoss = this.roundLoss.bind(this);
    }

    /** Lazily create AudioContext on first user interaction */
    _ensureCtx() {
        if (!this._ctx) {
            const Ctor = window.AudioContext || window.webkitAudioContext;
            if (!Ctor) return null;
            this._ctx = new Ctor();
        }
        // Resume if suspended (autoplay policy)
        if (this._ctx.state === 'suspended') {
            this._ctx.resume().catch(() => {});
        }
        return this._ctx;
    }

    /** Master gate — skip if muted or no audio hardware */
    _play(fn) {
        if (this._muted) return;
        const ctx = this._ensureCtx();
        if (!ctx) return;
        try { fn(ctx); } catch (_) { /* silently ignore audio errors */ }
    }

    // ── Public API ────────────────────────────────────────────────

    /** Toggle mute state. Returns new muted state. */
    toggle() {
        this._muted = !this._muted;
        try { localStorage.setItem('scruggle_muted', this._muted); } catch (_) {}
        return this._muted;
    }

    setMuted(val) {
        this._muted = !!val;
        try { localStorage.setItem('scruggle_muted', this._muted); } catch (_) {}
    }

    isMuted() {
        return this._muted;
    }

    // ── Sound Effects ─────────────────────────────────────────────

    /** Short click/pop for placing a tile on the board */
    tilePlace() {
        this._play(ctx => {
            const t = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, t);
            osc.frequency.exponentialRampToValueAtTime(800, t + 0.04);
            gain.gain.setValueAtTime(0.15, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
            osc.connect(gain).connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.08);
        });
    }

    /** Ascending chime for successful word submission */
    wordSubmit() {
        this._play(ctx => {
            const t = ctx.currentTime;
            const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                const start = t + i * 0.1;
                osc.frequency.setValueAtTime(freq, start);
                gain.gain.setValueAtTime(0.18, start);
                gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
                osc.connect(gain).connect(ctx.destination);
                osc.start(start);
                osc.stop(start + 0.25);
            });
        });
    }

    /** Low buzz / error tone for invalid word */
    invalidWord() {
        this._play(ctx => {
            const t = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(110, t);
            osc.frequency.linearRampToValueAtTime(90, t + 0.3);
            gain.gain.setValueAtTime(0.12, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
            osc.connect(gain).connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.35);
        });
    }

    /** Coin sound — two quick metallic pings */
    goldEarned() {
        this._play(ctx => {
            const t = ctx.currentTime;
            [2637, 3136].forEach((freq, i) => { // E7, G7
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                const start = t + i * 0.06;
                osc.frequency.setValueAtTime(freq, start);
                gain.gain.setValueAtTime(0.12, start);
                gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
                osc.connect(gain).connect(ctx.destination);
                osc.start(start);
                osc.stop(start + 0.18);
            });
        });
    }

    /** Fanfare for achievement unlock */
    achievementUnlock() {
        this._play(ctx => {
            const t = ctx.currentTime;
            // Majestic ascending brass-like fanfare
            const notes = [
                { freq: 392, startOff: 0.0, dur: 0.15 },   // G4
                { freq: 0, startOff: 0.15, dur: 0.05 },    // gap
                { freq: 392, startOff: 0.2, dur: 0.1 },    // G4
                { freq: 0, startOff: 0.3, dur: 0.05 },     // gap
                { freq: 523.25, startOff: 0.35, dur: 0.12 }, // C5
                { freq: 659.25, startOff: 0.47, dur: 0.12 }, // E5
                { freq: 783.99, startOff: 0.59, dur: 0.35 }, // G5 — held
                { freq: 1046.5, startOff: 0.7, dur: 0.25 },  // C6
            ];
            notes.forEach(({ freq, startOff, dur }) => {
                if (freq === 0) return;
                const start = t + startOff;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freq, start);
                gain.gain.setValueAtTime(0.10, start);
                gain.gain.linearRampToValueAtTime(0.06, start + dur * 0.5);
                gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
                osc.connect(gain).connect(ctx.destination);
                osc.start(start);
                osc.stop(start + dur);
            });
            // Sub-bass rumble
            const bass = ctx.createOscillator();
            const bassGain = ctx.createGain();
            bass.type = 'sine';
            bass.frequency.setValueAtTime(65.41, t + 0.35); // C2
            bassGain.gain.setValueAtTime(0.06, t + 0.35);
            bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
            bass.connect(bassGain).connect(ctx.destination);
            bass.start(t + 0.35);
            bass.stop(t + 0.9);
        });
    }

    /** Celebration sound for winning a round */
    roundWin() {
        this._play(ctx => {
            const t = ctx.currentTime;
            // Triumphant rising arpeggio
            const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                const start = t + i * 0.12;
                osc.frequency.setValueAtTime(freq, start);
                gain.gain.setValueAtTime(0.20, start);
                gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
                osc.connect(gain).connect(ctx.destination);
                osc.start(start);
                osc.stop(start + 0.35);
            });
            // Sparkle overlay at the end
            const sparkle = ctx.createOscillator();
            const sparkleGain = ctx.createGain();
            sparkle.type = 'sine';
            sparkle.frequency.setValueAtTime(1568, t + 0.48); // G6
            sparkleGain.gain.setValueAtTime(0.08, t + 0.48);
            sparkleGain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
            sparkle.connect(sparkleGain).connect(ctx.destination);
            sparkle.start(t + 0.48);
            sparkle.stop(t + 0.7);
        });
    }

    /** Sad trombone for round loss */
    roundLoss() {
        this._play(ctx => {
            const t = ctx.currentTime;
            // Descending "wah wah" — sawtooth with pitch bend
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            // Start high, bend down
            osc.frequency.setValueAtTime(392, t);       // G4
            osc.frequency.linearRampToValueAtTime(349.23, t + 0.2); // F4
            osc.frequency.linearRampToValueAtTime(311.13, t + 0.35); // Eb4
            osc.frequency.linearRampToValueAtTime(261.63, t + 0.5);  // C4
            osc.frequency.linearRampToValueAtTime(196, t + 0.65);    // G3
            osc.frequency.linearRampToValueAtTime(146.83, t + 0.9);  // D3
            gain.gain.setValueAtTime(0.12, t);
            gain.gain.linearRampToValueAtTime(0.10, t + 0.3);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
            osc.connect(gain).connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 1.0);

            // Second oscillator for fuller sound
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(392, t);
            osc2.frequency.linearRampToValueAtTime(349.23, t + 0.2);
            osc2.frequency.linearRampToValueAtTime(311.13, t + 0.35);
            osc2.frequency.linearRampToValueAtTime(261.63, t + 0.5);
            osc2.frequency.linearRampToValueAtTime(196, t + 0.65);
            osc2.frequency.linearRampToValueAtTime(146.83, t + 0.9);
            gain2.gain.setValueAtTime(0.06, t);
            gain2.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
            osc2.connect(gain2).connect(ctx.destination);
            osc2.start(t);
            osc2.stop(t + 1.0);
        });
    }
}

const audio = new AudioManager();
export default audio;