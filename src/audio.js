/**
 * AudioManager — Web Audio API sound effects for Scruggle.
 * Synthesized tones, no external files needed. Singleton export.
 */
class AudioManager {
    constructor() {
        this._ctx = null;
        this._muted = localStorage.getItem('scruggle_muted') === 'true';
    }

    /** Lazily create AudioContext (must happen from user gesture on most browsers). */
    _getCtx() {
        if (!this._ctx) {
            this._ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this._ctx.state === 'suspended') {
            this._ctx.resume();
        }
        return this._ctx;
    }

    get muted() { return this._muted; }

    /** Toggle mute on/off. Returns new muted state. */
    toggle() {
        this._muted = !this._muted;
        localStorage.setItem('scruggle_muted', String(this._muted));
        return this._muted;
    }

    /** Play a tone. All params optional with sensible defaults. */
    _playTone(freq, duration = 0.1, type = 'sine', volume = 0.15) {
        if (this._muted) return;
        try {
            const ctx = this._getCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(volume, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + duration);
        } catch (_) { /* silently ignore audio errors */ }
    }

    /** Play a multi-note sequence. */
    _playSequence(notes, baseTime = 0, noteDuration = 0.12, type = 'sine', volume = 0.15) {
        if (this._muted || notes.length === 0) return;
        try {
            const ctx = this._getCtx();
            notes.forEach((freq, i) => {
                const start = ctx.currentTime + baseTime + i * noteDuration * 0.8;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, start);
                gain.gain.setValueAtTime(volume, start);
                gain.gain.exponentialRampToValueAtTime(0.001, start + noteDuration);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(start);
                osc.stop(start + noteDuration);
            });
        } catch (_) { /* silently ignore */ }
    }

    /** Short click/pop for tile placement. */
    tilePlace() {
        if (this._muted) return;
        try {
            const ctx = this._getCtx();
            const now = ctx.currentTime;
            // Quick noise burst for tactile feel
            const bufferSize = ctx.sampleRate * 0.03;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
            noise.connect(gain);
            gain.connect(ctx.destination);
            noise.start(now);
            noise.stop(now + 0.05);

            // Also a high sine pip
            this._playTone(880, 0.04, 'sine', 0.08);
        } catch (_) { /* silently ignore */ }
    }

    /** Ascending chime on valid word submission. */
    wordSubmit() {
        this._playSequence([523.25, 659.25, 783.99], 0, 0.1, 'sine', 0.15);
    }

    /** Low buzz for invalid word. */
    invalidWord() {
        this._playTone(150, 0.3, 'sawtooth', 0.12);
    }

    /** Coin plink earned gold. */
    goldEarned() {
        this._playSequence([1318.5, 1760], 0, 0.08, 'sine', 0.1);
    }

    /** Fanfare when an achievement is unlocked. */
    achievementUnlock() {
        this._playSequence([523.25, 659.25, 783.99, 1046.50], 0, 0.15, 'sine', 0.13);
    }

    /** Celebration arpeggio for round win. */
    roundWin() {
        this._playSequence([523.25, 659.25, 783.99, 1046.5, 1318.5], 0.05, 0.12, 'triangle', 0.15);
    }

    /** Sad trombone descending slide for round loss. */
    roundLoss() {
        if (this._muted) return;
        try {
            const ctx = this._getCtx();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(120, now + 0.7);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 1.0);

            // Final low thump
            const thump = ctx.createOscillator();
            const thumpGain = ctx.createGain();
            thump.type = 'sine';
            thump.frequency.setValueAtTime(60, now + 0.7);
            thumpGain.gain.setValueAtTime(0.1, now + 0.7);
            thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
            thump.connect(thumpGain);
            thumpGain.connect(ctx.destination);
            thump.start(now + 0.7);
            thump.stop(now + 1.0);
        } catch (_) { /* silently ignore */ }
    }
}

const audio = new AudioManager();
export default audio;
