class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Inicialización perezosa (lazy) para compatibilidad con SSR y políticas de autoplay del navegador
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {
        // Ignorar si el navegador aún no permite el resume
      });
    }

    return this.ctx;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  /**
   * Toca un tono simple con oscilador y envolvente de volumen exponencial.
   */
  private playTone(frequency: number, durationSeconds: number, type: OscillatorType = 'sine', gainLevel = 0.2): void {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      gain.gain.setValueAtTime(gainLevel, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationSeconds);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + durationSeconds);
    } catch {
      // Manejar posibles excepciones silenciosas de audio en navegadores restrictivos
    }
  }

  /**
   * Pitido corto agudo (660 Hz, 120 ms) para cuenta atrás (3, 2, 1).
   */
  public playPrepBeep(): void {
    this.playTone(660, 0.12, 'sine', 0.25);
  }

  /**
   * Pitido largo claro y enérgico (880 Hz, 350 ms) para la señal de inicio ("¡YA!").
   */
  public playStartBeep(): void {
    this.playTone(880, 0.35, 'triangle', 0.3);
  }

  /**
   * Doble pitido breve (740 Hz) al alcanzar el ecuador o mitad de la prueba.
   */
  public playHalfwayBeep(): void {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    try {
      // Primer pulso
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.frequency.setValueAtTime(740, now);
      gain1.gain.setValueAtTime(0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.08);

      // Segundo pulso (100ms después)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.frequency.setValueAtTime(740, now + 0.1);
      gain2.gain.setValueAtTime(0.25, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.18);
    } catch {
      // Silencioso ante bloqueo de audio
    }
  }

  /**
   * Secuencia descendente armónica (880 Hz -> 660 Hz -> 520 Hz) para señalar el final de la prueba.
   */
  public playFinishBeep(): void {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const freqs = [880, 660, 520];
    const stepDuration = 0.15;
    const now = ctx.currentTime;

    freqs.forEach((freq, idx) => {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.13;

        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + stepDuration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + stepDuration);
      } catch {
        // Silencioso
      }
    });
  }

  /**
   * Clic suave y seco de confirmación táctil (440 Hz, 40 ms) para el contador +1.
   */
  public playTapClick(): void {
    this.playTone(440, 0.04, 'sine', 0.15);
  }
}

// Instancia singleton para toda la aplicación
export const audioSynth = new AudioSynthesizer();
