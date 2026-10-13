/**
 * Audio Synthesizer for "Né Sao Được - Dây Chuyền Trà Sữa Thất Lạc Topping"
 * Powered by Web Audio API for zero-latency, realistic suspense & classroom sound effects.
 */

import { SuspenseTheme } from '../types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.8;
  private suspenseEnabled: boolean = true;
  private noiseBuffer: AudioBuffer | null = null;

  // Active suspense nodes for continuous drones/rolls
  private activeDroneOscs: OscillatorNode[] = [];
  private activeDroneGains: GainNode[] = [];
  private drumrollTimer: ReturnType<typeof setTimeout> | null = null;
  private isSuspenseRunning: boolean = false;
  private currentTheme: SuspenseTheme = 'millionaire';

  private getContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Pre-generate white noise buffer for realistic snare drums, cymbals, and risers
  private getNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (!this.noiseBuffer || this.noiseBuffer.sampleRate !== ctx.sampleRate) {
      const bufferSize = ctx.sampleRate * 2; // 2 seconds of noise
      this.noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }
    return this.noiseBuffer;
  }

  public setConfig(enabled: boolean, volume: number, suspenseEnabled: boolean = true) {
    this.enabled = enabled;
    this.volume = Math.max(0, Math.min(1, volume));
    this.suspenseEnabled = suspenseEnabled;
  }

  // =========================================================================
  // 1. CONVEYOR & WHEEL TICKING SOUNDS
  // =========================================================================

  // Conveyor tick as toppings/names move past
  public playConveyorTick(pitchMultiplier = 1, theme: SuspenseTheme = 'millionaire') {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      if (theme === 'squid_suspense') {
        // Crisp clockwork mechanical escapement tick
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const freq = 1200 * pitchMultiplier;
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.025);

        gain.gain.setValueAtTime(0.18 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.035);
      } else if (theme === 'drumroll') {
        // Light snare tap
        this.playSnareTap(0.12 * this.volume * pitchMultiplier);
      } else {
        // Standard punchy conveyor bubble tick
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const baseFreq = 380 * pitchMultiplier;
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.6, now + 0.035);

        gain.gain.setValueAtTime(0.16 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.045);
      }
    } catch {
      // Ignore
    }
  }

  // Snare tap hit
  private playSnareTap(intensity: number) {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const noise = ctx.createBufferSource();
      noise.buffer = this.getNoiseBuffer(ctx);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.Q.setValueAtTime(2.5, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(Math.min(0.4, intensity), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.04);
    } catch {}
  }

  // =========================================================================
  // 2. ACTIVE SUSPENSE SESSION MANAGEMENT
  // =========================================================================

  public startSuspenseSession(theme: SuspenseTheme, totalDurationMs: number) {
    if (!this.enabled || !this.suspenseEnabled) return;
    this.stopSuspenseSession();
    this.isSuspenseRunning = true;
    this.currentTheme = theme;

    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const durationSec = totalDurationMs / 1000;

      if (theme === 'millionaire') {
        // "Ai Là Triệu Phú": Ominous Dissonant Mystery Drone (D2 + Eb2 tritone tension)
        const freqs = [73.42, 77.78, 146.83]; // D2, Eb2, D3
        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = idx === 0 ? 'sawtooth' : 'sine';
          osc.frequency.setValueAtTime(f, now);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(180, now);
          // Slowly open filter as spin continues
          filter.frequency.exponentialRampToValueAtTime(550, now + durationSec);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.12 * this.volume, now + 0.4);
          gain.gain.linearRampToValueAtTime(0.18 * this.volume, now + durationSec * 0.85);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          this.activeDroneOscs.push(osc);
          this.activeDroneGains.push(gain);
        });
      } else if (theme === 'cinematic_heartbeat') {
        // "Nhịp Tim Bom Tấn": Sub-bass drone + subtle pitch bend
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(55, now);
        osc.frequency.linearRampToValueAtTime(65, now + durationSec);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.15 * this.volume, now + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        this.activeDroneOscs.push(osc);
        this.activeDroneGains.push(gain);
      } else if (theme === 'squid_suspense') {
        // "Đồng Hồ Sinh Tử": Eerie atmospheric tension pad
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now); // A3
        osc.frequency.linearRampToValueAtTime(233.08, now + durationSec); // Bb3 tension

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.09 * this.volume, now + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        this.activeDroneOscs.push(osc);
        this.activeDroneGains.push(gain);
      }
    } catch {
      // Ignore
    }
  }

  // Trigger drumroll roll burst (for 'drumroll' theme during deceleration)
  public playDrumrollBurst(intensity = 1) {
    if (!this.enabled || !this.suspenseEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Snare drum roll rapid bursts
      const noise = ctx.createBufferSource();
      noise.buffer = this.getNoiseBuffer(ctx);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1900, now);
      filter.Q.setValueAtTime(3.2, now);

      const gain = ctx.createGain();
      const vol = 0.28 * this.volume * Math.min(1.6, intensity);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.13);

      // Low Timpani pulse
      const timpani = ctx.createOscillator();
      const timpaniGain = ctx.createGain();
      timpani.type = 'sine';
      timpani.frequency.setValueAtTime(95, now);
      timpani.frequency.exponentialRampToValueAtTime(45, now + 0.14);

      timpaniGain.gain.setValueAtTime(0.22 * this.volume * intensity, now);
      timpaniGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      timpani.connect(timpaniGain);
      timpaniGain.connect(ctx.destination);

      timpani.start(now);
      timpani.stop(now + 0.15);
    } catch {}
  }

  // Heartbeat sound (Lub-Dub) for high suspense / dramatic countdown
  public playHeartbeat(intensity = 1) {
    if (!this.enabled || !this.suspenseEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const vol = 0.38 * this.volume * Math.min(1.8, intensity);

      // 1st Beat (Lub) - Deep sub-bass thump that vibrates in room
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      const filter1 = ctx.createBiquadFilter();

      filter1.type = 'lowpass';
      filter1.frequency.setValueAtTime(110, now);

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(70, now);
      osc1.frequency.exponentialRampToValueAtTime(32, now + 0.14);

      gain1.gain.setValueAtTime(0.01, now);
      gain1.gain.linearRampToValueAtTime(vol, now + 0.035);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc1.connect(filter1);
      filter1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.17);

      // 2nd Beat (Dub) - Slightly higher pitch, following closely
      const dubTime = now + 0.15;
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      const filter2 = ctx.createBiquadFilter();

      filter2.type = 'lowpass';
      filter2.frequency.setValueAtTime(125, dubTime);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(82, dubTime);
      osc2.frequency.exponentialRampToValueAtTime(36, dubTime + 0.12);

      gain2.gain.setValueAtTime(0.01, dubTime);
      gain2.gain.linearRampToValueAtTime(vol * 0.9, dubTime + 0.03);
      gain2.gain.exponentialRampToValueAtTime(0.001, dubTime + 0.15);

      osc2.connect(filter2);
      filter2.connect(gain2);
      gain2.connect(ctx.destination);

      osc2.start(dubTime);
      osc2.stop(dubTime + 0.16);
    } catch {
      // Ignore
    }
  }

  // Tense clock alarm ping for 'squid_suspense'
  public playTensionPing(step = 0) {
    if (!this.enabled || !this.suspenseEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Alternating semitones (E6 / F6)
      const freq = step % 2 === 0 ? 1318.51 : 1396.91;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.18 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {}
  }

  // Suspense riser / tension swell as the conveyor is about to stop
  public playSuspenseRiser(duration = 0.9) {
    if (!this.enabled || !this.suspenseEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Tension bass riser
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(75, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + duration);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, now);
      filter.frequency.exponentialRampToValueAtTime(1400, now + duration);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.24 * this.volume, now + duration * 0.85);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);

      // Cymbal riser swell
      const noise = ctx.createBufferSource();
      noise.buffer = this.getNoiseBuffer(ctx);
      const cymbalFilter = ctx.createBiquadFilter();
      cymbalFilter.type = 'highpass';
      cymbalFilter.frequency.setValueAtTime(3000, now);
      cymbalFilter.frequency.exponentialRampToValueAtTime(8000, now + duration);

      const cymbalGain = ctx.createGain();
      cymbalGain.gain.setValueAtTime(0.001, now);
      cymbalGain.gain.exponentialRampToValueAtTime(0.18 * this.volume, now + duration * 0.9);
      cymbalGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(cymbalFilter);
      cymbalFilter.connect(cymbalGain);
      cymbalGain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + duration);
    } catch {
      // Ignore
    }
  }

  // Stop active drone/loops cleanly
  public stopSuspenseSession() {
    this.isSuspenseRunning = false;
    if (this.drumrollTimer) {
      clearTimeout(this.drumrollTimer);
      this.drumrollTimer = null;
    }
    const ctx = this.ctx;
    if (ctx) {
      const now = ctx.currentTime;
      this.activeDroneGains.forEach(gain => {
        try {
          gain.gain.linearRampToValueAtTime(0.001, now + 0.15);
        } catch {}
      });
      setTimeout(() => {
        this.activeDroneOscs.forEach(osc => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {}
        });
        this.activeDroneOscs = [];
        this.activeDroneGains = [];
      }, 160);
    }
  }

  // =========================================================================
  // 3. DRAMATIC REVEAL & VICTORY IMPACT SOUNDS
  // =========================================================================

  // Dramatic Hit when student is chosen
  public playDramaticReveal(theme: SuspenseTheme = this.currentTheme) {
    if (!this.enabled) return;
    this.stopSuspenseSession();
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // 1. MASSIVE 808 SUB IMPACT DROP
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(150, now);
      subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.5);

      subGain.gain.setValueAtTime(0.45 * this.volume, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.55);

      // 2. THEME-SPECIFIC REVEAL SIGNATURE
      if (theme === 'drumroll') {
        // Massive Orchestral Crash Cymbal Explosion + Timpani Boom
        const noise = ctx.createBufferSource();
        noise.buffer = this.getNoiseBuffer(ctx);
        const cymbalFilter = ctx.createBiquadFilter();
        cymbalFilter.type = 'highpass';
        cymbalFilter.frequency.setValueAtTime(4500, now);

        const cymbalGain = ctx.createGain();
        cymbalGain.gain.setValueAtTime(0.35 * this.volume, now);
        cymbalGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        noise.connect(cymbalFilter);
        cymbalFilter.connect(cymbalGain);
        cymbalGain.connect(ctx.destination);
        noise.start(now);
        noise.stop(now + 1.25);
      } else if (theme === 'cinematic_heartbeat') {
        // Hollywood Inception Horn (Detuned cinematic brass blast: D2 + A2 + D3)
        [73.42, 110, 146.83, 220].forEach(freq => {
          const horn = ctx.createOscillator();
          const hornGain = ctx.createGain();
          const hornFilter = ctx.createBiquadFilter();

          horn.type = 'sawtooth';
          horn.frequency.setValueAtTime(freq, now);

          hornFilter.type = 'lowpass';
          hornFilter.frequency.setValueAtTime(1800, now);
          hornFilter.frequency.exponentialRampToValueAtTime(350, now + 0.7);

          hornGain.gain.setValueAtTime(0.12 * this.volume, now);
          hornGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

          horn.connect(hornFilter);
          hornFilter.connect(hornGain);
          hornGain.connect(ctx.destination);

          horn.start(now);
          horn.stop(now + 0.72);
        });
      } else {
        // "Ai Là Triệu Phú" & "Đồng Hồ Sinh Tử": Dramatic Gong & Brass Hit Chord
        const chordFreqs = [220, 277.18, 329.63, 440, 554.37];
        chordFreqs.forEach(freq => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.1 * this.volume, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.62);
        });
      }
    } catch {
      // Ignore
    }
  }

  // Celebration fanfare when a student is picked
  public playTadaCelebration() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const notes = [440, 554.37, 659.25, 880, 1108.73]; // A major triumphant chord
      const startTime = ctx.currentTime;

      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime + index * 0.07);

        gain.gain.setValueAtTime(0.001, startTime + index * 0.07);
        gain.gain.linearRampToValueAtTime(0.24 * this.volume, startTime + index * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + index * 0.07 + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime + index * 0.07);
        osc.stop(startTime + index * 0.07 + 0.5);
      });
    } catch {
      // Ignore
    }
  }

  // Quick 1.4-second Demo Preview for each Suspense Theme
  public playSuspensePreview(theme: SuspenseTheme) {
    if (!this.enabled) return;
    this.stopSuspenseSession();

    if (theme === 'drumroll') {
      this.playDrumrollBurst(1.2);
      setTimeout(() => this.playDrumrollBurst(1.5), 180);
      setTimeout(() => this.playSuspenseRiser(0.6), 360);
      setTimeout(() => {
        this.playDramaticReveal('drumroll');
        setTimeout(() => this.playTadaCelebration(), 250);
      }, 750);
    } else if (theme === 'cinematic_heartbeat') {
      this.playHeartbeat(1.3);
      setTimeout(() => this.playHeartbeat(1.7), 350);
      setTimeout(() => this.playSuspenseRiser(0.5), 500);
      setTimeout(() => {
        this.playDramaticReveal('cinematic_heartbeat');
        setTimeout(() => this.playTadaCelebration(), 250);
      }, 850);
    } else if (theme === 'squid_suspense') {
      this.playConveyorTick(1.2, 'squid_suspense');
      setTimeout(() => this.playTensionPing(0), 180);
      setTimeout(() => this.playTensionPing(1), 320);
      setTimeout(() => this.playSuspenseRiser(0.5), 450);
      setTimeout(() => {
        this.playDramaticReveal('squid_suspense');
        setTimeout(() => this.playTadaCelebration(), 250);
      }, 800);
    } else {
      // millionaire
      this.startSuspenseSession('millionaire', 900);
      setTimeout(() => this.playHeartbeat(1.4), 200);
      setTimeout(() => this.playSuspenseRiser(0.6), 400);
      setTimeout(() => {
        this.playDramaticReveal('millionaire');
        setTimeout(() => this.playTadaCelebration(), 250);
      }, 800);
    }
  }

  // =========================================================================
  // 4. CLASSROOM & INTERACTION SOUNDS
  // =========================================================================

  // Bubbly "bloop" as topping drops on conveyor
  public playToppingDrop() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(650, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.25 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Ignore
    }
  }

  // Crisp button click when choosing A, B, C, D or True/False
  public playOptionSelect() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.12 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Ignore
    }
  }

  // Countdown timer tick with metallic edge
  public playTimerTick() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(860, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(740, ctx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.14 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.035);
    } catch {
      // Ignore
    }
  }

  // Urgent warning tick when countdown is < 6s (gameshow high-stress clock)
  public playTimerUrgent() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(1100, now);
      osc1.frequency.exponentialRampToValueAtTime(620, now + 0.05);

      gain1.gain.setValueAtTime(0.2 * this.volume, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.06);
    } catch {
      // Ignore
    }
  }

  // Time is up buzzer
  public playTimeUpBuzzer() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.setValueAtTime(180, ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.25 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch {
      // Ignore
    }
  }

  // Correct answer chime (Victory chord)
  public playCorrectSound() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const startTime = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime + idx * 0.07);

        gain.gain.setValueAtTime(0.2 * this.volume, startTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + idx * 0.07 + 0.32);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime + idx * 0.07);
        osc.stop(startTime + idx * 0.07 + 0.35);
      });
    } catch {
      // Ignore
    }
  }

  // Wrong / Try again buzzer (Gameshow fail sound)
  public playWrongSound() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [185, 196].forEach(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.2 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      });
    } catch {
      // Ignore
    }
  }
}

export const soundManager = new SoundEngine();
