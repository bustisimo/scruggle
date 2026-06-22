/**
 * AudioManager — Web Audio API sound synthesis singleton for Scruggle.
 * No external files needed. All sounds are procedurally generated.
 */
class AudioManager {
    constructor() {
        this._ctx = null;
        this._muted = false;
        this._masterGain = null;
        this._initialized = false;

        // Restore saved mute preference
        try {
            this._muted = localStorage.getItem('scruggle_muted') === 'true';
        } catch { /* localStorage unavailable */ }
    }

    /** Lazily create AudioContext on first interaction (autoplay policy safe) */
    _ensureContext() {
        if (this._ctx) return this._ctx;
        const Ctor = window.AudioContext || window.webkitAudioContext;
        if (!Ctor) return null;
        this._ctx = new Ctor();
        if (this._ctx.state === 'suspended') {
            this._ctx.resume();
        }
        this._masterGain = this._ctx.createGain();
        this._masterGain.gain.value = this._muted ? 0 : 1;
        this._masterGain.connect(this._ctx.destination);
        this._initialized = true;
        return this._ctx;
    }

    /** Create an oscillator helper: type, freq, duration, gain envelope */
    _playTone(type, frequency, duration, options = {}) {
        const ctx = this._ensureContext();
        if (!ctx) return;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        osc.type = type || 'sine';

        const gain = ctx.createGain();
        gain.connect(this._masterGain);
        osc.connect(gain);

        osc.frequency.setValueAtTime(frequency, now);

        const { gainStart = 0.3, gainEnd = 0, rampEnd = duration, rampStart = 0 } = options;
        gain.gain.setValueAtTime(gainStart, now + (rampStart || 0));
        gain.gain.exponentialRampToValueAtTime(gainEnd || 0.001, now + (rampEnd || duration));

        osc.start(now);
        osc.stop(now + duration + 0.05);
    }

    /** Quick pop/click for tile placement */
    tilePlace() {
        const ctx = this._ensureContext();
        if (!ctx) return;
        const now = ctx.currentTime;

        // Very short noise burst for click feel
        const bufferSize = ctx.sampleRate * 0.04;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        gain.connect(this._masterGain);
        source.connect(gain);
        source.start(now);
        source.stop(now + 0.08);

        // Add a soft sine blip on top
        this._playTone('sine', 800, 0.06, { gainStart: 0.08, rampEnd: 0.06 });
    }

    /** Ascending chime for valid word submission */
    wordSubmit() {
        const ctx = this._ensureContext();
        if (!ctx) return;
        const now = ctx.currentTime;

        // Two ascending tones — like a two-note chime
        const notes = [523.25, 659.25]; // C5, E5
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            const gain = ctx.createGain();
            gain.connect(this._masterGain);
            osc.connect(gain);

            const start = now + i * 0.12;
            osc.frequency.setValueAtTime(freq, start);
            gain.gain.setValueAtTime(0.15, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);

            osc.start(start);
            osc.stop(start + 0.35);
        });

        // Add a soft upper harmonic shimmer
        const osc3 = ctx.createOscillator();
        osc3.type = 'sine';
        const g3 = ctx.createGain();
        g3.connect(this._masterGain);
        osc3.connect(g3);
        osc3.frequency.setValueAtTime(1318.5, now); // E6
        g3.gain.setValueAtTime(0.04, now + 0.12);
        g3.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc3.start(now);
        osc3.stop(now + 0.5);
    }

    /** Low buzz for invalid word */
    invalidWord() {
        this._playTone('sawtooth', 110, 0.25, { gainStart: 0.1, rampEnd: 0.25 });
        this._playTone('square', 55, 0.3, { gainStart: 0.05, rampEnd: 0.3 });
    }

    /** Coin / gold earned sound — quick bright ding with a metallic feel */
    goldEarned() {
        const ctx = this._ensureContext();
        if (!ctx) return;
        const now = ctx.currentTime;

        // Bright two-tone: E6 + G6 for a shiny coin effect
        [1318.5, 1568.0].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            const gain = ctx.createGain();
            gain.connect(this._masterGain);
            osc.connect(gain);

            const start = now + i * 0.04;
            osc.frequency.setValueAtTime(freq, start);
            gain.gain.setValueAtTime(0.1, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);

            osc.start(start);
            osc.stop(start + 0.25);
        });

        // Short noise burst for the initial "click" of the coin
        const bufferSize = Math.floor(ctx.sampleRate * 0.01);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.06, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        g.connect(this._masterGain);
        src.connect(g);
        src.start(now);
        src.stop(now + 0.04);
    }

    /** Fanfare for achievement unlock — bright three-tone ascending chord */
    achievementUnlock() {
        const ctx = this._ensureContext();
        if (!ctx) return;
        const now = ctx.currentTime;

        // Triumphant chord: C major (C4 E4 G4) then C5 E5 G5
        [
            [523.25, 659.25, 783.99],  // C5, E5, G5
            [1046.5, 1318.5, 1568.0], // C6, E6, G6
        ].forEach((chord, chordIdx) => {
            chord.forEach((freq, noteIdx) => {
                const osc = ctx.createOscillator();
                osc.type = noteIdx === 0 ? 'triangle' : 'sine';
                const gain = ctx.createGain();
                gain.connect(this._masterGain);
                osc.connect(gain);

                const start = now + chordIdx * 0.18 + noteIdx * 0.04;
                osc.frequency.setValueAtTime(freq, start);
                const vol = chordIdx === 0 ? 0.08 : 0.12;
                gain.gain.setValueAtTime(vol, start);
                gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6);

                osc.start(start);
                osc.stop(start + 0.65);
            });
        });

        // Bright shimmer on top
        const shimmer = ctx.createOscillator();
        shimmer.type = 'sine';
        const sg = ctx.createGain();
        sg.connect(this._masterGain);
        shimmer.connect(sg);
        shimmer.frequency.setValueAtTime(2093.0, now + 0.2); // C7
        sg.gain.setValueAtTime(0.03, now + 0.3);
        sg.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        shimmer.start(now);
        shimmer.stop(now + 0.85);
    }

    /** Celebration for round win — rising arpeggio with sparkle */
    roundWin() {
        const ctx = this._ensureContext();
        if (!ctx) return;
        const now = ctx.currentTime;

        // Ascending arpeggio: C5 E5 G5 C6 E6 G6 C7
        const arpeggio = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1568.0, 2093.0];
        arpeggio.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            osc.type = i < 3 ? 'triangle' : 'sine';
            const gain = ctx.createGain();
            gain.connect(this._masterGain);
            osc.connect(gain);

            const start = now + i * 0.07;
            osc.frequency.setValueAtTime(freq, start);
            const vol = i < 3 ? 0.08 : 0.1;
            gain.gain.setValueAtTime(vol, start);
            gain.gain.setValueAtTime(vol, start + 0.35);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.7);

            osc.start(start);
            osc.stop(start + 0.75);
        });

        // Noise sparkle shimmer at the peak
        const bufferSize = Math.floor(ctx.sampleRate * 0.6);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) * 0.5;
        }
        const src = ctx.createBufferSource();
        src.buffer = buffer;

        // Bandpass filter for sparkle
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(4000, now);
        filter.Q.setValueAtTime(0.5, now);

        const sg = ctx.createGain();
        sg.gain.setValueAtTime(0.04, now + 0.25);
        sg.gain.setValueAtTime(0.06, now + 0.4);
        sg.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

        src.connect(filter);
        filter.connect(sg);
        sg.connect(this._masterGain);
        src.start(now);
        src.stop(now + 0.65);
    }

    /** Sad trombone for round loss — descending slide */
    roundLoss() {
        const ctx = this._ensureContext();
        if (!ctx) return;
        const now = ctx.currentTime;

        // Slow descending slide — like a trombone wah
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        const gain = ctx.createGain();
        gain.connect(this._masterGain);
        osc.connect(gain);

        osc.frequency.setValueAtTime(350, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.8);
        gain.gain.setValueAtTime(0.08, now + 0.05);
        gain.gain.setValueAtTime(0.08, now + 0.6);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

        osc.start(now);
        osc.stop(now + 1.1);

        // Low sine for the "wah" body
        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        const g2 = ctx.createGain();
        g2.connect(this._masterGain);
        osc2.connect(g2);
        osc2.frequency.setValueAtTime(175, now);
        osc2.frequency.linearRampToValueAtTime(55, now + 0.8);
        g2.gain.setValueAtTime(0.04, now + 0.1);
        g2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
        osc2.start(now);
        osc2.stop(now + 1.0);

        // Add a tiny vibrato for pathos
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(4, now);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(8, now);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start(now);
        lfo.stop(now + 0.9);
    }

    /** Toggle mute state */
    toggle() {
        this._muted = !this._muted;
        if (this._masterGain) {
            this._masterGain.gain.value = this._muted ? 0 : 1;
        } else if (this._ctx) {
            // Create master gain if context exists but not connected
            this._masterGain = this._ctx.createGain();
            this._masterGain.gain.value = this._muted ? 0 : 1;
            this._masterGain.connect(this._ctx.destination);
        }
        try {
            localStorage.setItem('scruggle_muted', this._muted);
        } catch { /* ignore */ }
        return this._muted;
    }

    /** Check current mute state */
    isMuted() {
        return this._muted;
    }
}

// Singleton export
const audio = new AudioManager();
export default audio;