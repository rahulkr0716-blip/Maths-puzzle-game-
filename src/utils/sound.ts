/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SoundTheme } from '../types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private isMuted: boolean = false;
  private currentTheme: SoundTheme = 'classic';

  private initContext() {
    if (!this.ctx) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
          this.analyser = this.ctx.createAnalyser();
          this.analyser.fftSize = 32;
          this.analyser.connect(this.ctx.destination);
        }
      } catch (e) {
        console.warn('AudioContext not supported in this browser:', e);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch((err) => console.log('Audio resume failed:', err));
    }
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  private connectDestination(node: AudioNode) {
    if (this.analyser) {
      node.connect(this.analyser);
    } else if (this.ctx) {
      node.connect(this.ctx.destination);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  getMuteState() {
    return this.isMuted;
  }

  setTheme(theme: SoundTheme) {
    this.currentTheme = theme;
    // Play a friendly theme tap to preview the sound
    this.playTap();
  }

  getTheme(): SoundTheme {
    return this.currentTheme;
  }

  playTap() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    if (this.currentTheme === 'classic') {
      // Classic bubble tap
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      this.connectDestination(gain);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      osc.start(now);
      osc.stop(now + 0.09);
    } 
    else if (this.currentTheme === 'jungle') {
      // Jungle woodblock pop
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.connect(filter);
      filter.connect(gain);
      this.connectDestination(gain);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1100, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.05);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, now);
      filter.Q.setValueAtTime(4, now);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

      osc.start(now);
      osc.stop(now + 0.07);
    } 
    else if (this.currentTheme === 'space') {
      // Mini laser pew!
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      this.connectDestination(gain);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(2000, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.08);

      osc.start(now);
      osc.stop(now + 0.09);
    }
  }

  playSuccess() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    if (this.currentTheme === 'classic') {
      // Classic friendly major arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        this.connectDestination(gain);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);
        
        gain.gain.setValueAtTime(0, now + index * 0.08);
        gain.gain.linearRampToValueAtTime(0.15, now + index * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.25);

        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.26);
      });
    } 
    else if (this.currentTheme === 'jungle') {
      // Jungle happy bird chirping 🐥
      const chirpsCount = 3;
      for (let i = 0; i < chirpsCount; i++) {
        const startOffset = i * 0.09;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        this.connectDestination(gain);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, now + startOffset);
        osc.frequency.exponentialRampToValueAtTime(2800, now + startOffset + 0.05);

        gain.gain.setValueAtTime(0, now + startOffset);
        gain.gain.linearRampToValueAtTime(0.1, now + startOffset + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + startOffset + 0.05);

        osc.start(now + startOffset);
        osc.stop(now + startOffset + 0.06);
      }
    } 
    else if (this.currentTheme === 'space') {
      // Space soaring phase chord
      const chords = [523.25, 783.99, 1174.66, 1567.98]; // C5, G5, D6, G6
      chords.forEach((freq, index) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const vibrato = this.ctx.createOscillator();
        const vibratoGain = this.ctx.createGain();

        vibrato.frequency.value = 15; // Fast vibrato frequency
        vibratoGain.gain.value = 25; // Pitch modulation depth

        vibrato.connect(vibratoGain);
        vibratoGain.connect(osc.frequency);

        osc.connect(gain);
        this.connectDestination(gain);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.06);

        gain.gain.setValueAtTime(0, now + index * 0.06);
        gain.gain.linearRampToValueAtTime(0.08, now + index * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.06 + 0.4);

        vibrato.start(now + index * 0.06);
        osc.start(now + index * 0.06);
        
        vibrato.stop(now + index * 0.06 + 0.41);
        osc.stop(now + index * 0.06 + 0.41);
      });
    }
  }

  playFail() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    if (this.currentTheme === 'classic') {
      // Classic sad low sawtooth drop
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.connect(filter);
      filter.connect(gain);
      this.connectDestination(gain);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.35);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, now);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.35);

      osc.start(now);
      osc.stop(now + 0.36);
    } 
    else if (this.currentTheme === 'jungle') {
      // Jungle low ribbit frog croak 🐸
      const croaksCount = 4;
      for (let i = 0; i < croaksCount; i++) {
        const offset = i * 0.06;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.connect(filter);
        filter.connect(gain);
        this.connectDestination(gain);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, now + offset);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(220, now + offset);

        gain.gain.setValueAtTime(0.15, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.045);

        osc.start(now + offset);
        osc.stop(now + offset + 0.05);
      }
    } 
    else if (this.currentTheme === 'space') {
      // Space warp drop
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.connect(filter);
      filter.connect(gain);
      this.connectDestination(gain);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.4);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, now);
      filter.frequency.linearRampToValueAtTime(100, now + 0.4);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.start(now);
      osc.stop(now + 0.41);
    }
  }

  playLevelUp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    if (this.currentTheme === 'classic') {
      // Classic sparkling run
      const notes = [783.99, 1046.50, 1318.51, 1567.98, 2093.00]; // G5, C6, E6, G6, C7
      notes.forEach((freq, index) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        this.connectDestination(gain);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.06);
        
        gain.gain.setValueAtTime(0, now + index * 0.06);
        gain.gain.linearRampToValueAtTime(0.12, now + index * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.06 + 0.35);

        osc.start(now + index * 0.06);
        osc.stop(now + index * 0.06 + 0.36);
      });
    } 
    else if (this.currentTheme === 'jungle') {
      // Jungle rolling marimba melody (Pentatonic run)
      const marimbaFreqs = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50]; // C5, D5, E5, G5, A5, C6
      marimbaFreqs.forEach((freq, index) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.connect(filter);
        filter.connect(gain);
        this.connectDestination(gain);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.06);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(freq, now + index * 0.06);
        filter.Q.setValueAtTime(5, now + index * 0.06);

        gain.gain.setValueAtTime(0, now + index * 0.06);
        gain.gain.linearRampToValueAtTime(0.25, now + index * 0.06 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.06 + 0.18);

        osc.start(now + index * 0.06);
        osc.stop(now + index * 0.06 + 0.2);
      });
    } 
    else if (this.currentTheme === 'space') {
      // Space portal jump! (Fast sci-fi sweeping rise)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const vibrato = this.ctx.createOscillator();
      const vibratoGain = this.ctx.createGain();

      vibrato.frequency.setValueAtTime(20, now);
      vibratoGain.gain.setValueAtTime(45, now);

      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc.frequency);

      osc.connect(gain);
      this.connectDestination(gain);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(2500, now + 0.6);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      vibrato.start(now);
      osc.start(now);

      vibrato.stop(now + 0.61);
      osc.stop(now + 0.61);
    }
  }

  playStar() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    if (this.currentTheme === 'classic') {
      // Classic high bell chime
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      this.connectDestination(gain);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.start(now);
      osc.stop(now + 0.42);
    } 
    else if (this.currentTheme === 'jungle') {
      // Jungle organic raindrop plop 💧
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      this.connectDestination(gain);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(1600, now + 0.12);
      
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.start(now);
      osc.stop(now + 0.13);
    } 
    else if (this.currentTheme === 'space') {
      // Space ring-modulation shimmering chime
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.connect(gain);
      osc2.connect(gain);
      this.connectDestination(gain);

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1500, now);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(2250, now); // 1.5x offset for metallic ring

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc1.start(now);
      osc2.start(now);

      osc1.stop(now + 0.41);
      osc2.stop(now + 0.41);
    }
  }

  vibrate(duration: number) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(duration);
      } catch (e) {
        // Ignore iframe vibration restriction errors gracefully
      }
    }
  }
}

export const sound = new SoundEngine();
