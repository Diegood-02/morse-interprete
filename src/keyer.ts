import { decodeSymbol } from './morse';

export type KeyerEvent =
  | { type: 'symbol'; symbol: '.' | '-' }
  | { type: 'letter'; char: string; code: string }
  | { type: 'space' };

/**
 * Telégrafo: interpreta pulsaciones de una sola tecla.
 * Unidad `unit` en ms: punto ≈ 1 unidad, raya ≈ 3, pausa de letra ≈ 3, pausa de palabra ≈ 7.
 * Es lógica pura (los tiempos se pasan como argumento), así que se puede probar sin DOM.
 */
export class Keyer {
  private code = '';
  private pressedAt: number | null = null;
  private lastReleaseAt: number | null = null;
  private letterDone = false;
  private spaceDone = false;

  constructor(public unit = 120) {}

  get pending(): string {
    return this.code;
  }

  get isDown(): boolean {
    return this.pressedAt !== null;
  }

  press(now: number): void {
    if (this.pressedAt !== null) return;
    this.pressedAt = now;
  }

  release(now: number): KeyerEvent | null {
    if (this.pressedAt === null) return null;
    const duration = now - this.pressedAt;
    this.pressedAt = null;
    this.lastReleaseAt = now;
    this.letterDone = false;
    this.spaceDone = false;
    const symbol = duration >= this.unit * 2 ? '-' : '.';
    this.code += symbol;
    return { type: 'symbol', symbol };
  }

  /** Llamar periódicamente: emite la letra tras 3 unidades de silencio y el espacio tras 7. */
  tick(now: number): KeyerEvent[] {
    const events: KeyerEvent[] = [];
    if (this.pressedAt !== null || this.lastReleaseAt === null) return events;
    const silence = now - this.lastReleaseAt;

    if (!this.letterDone && silence >= this.unit * 3 && this.code) {
      const code = this.code;
      this.code = '';
      this.letterDone = true;
      events.push({ type: 'letter', char: decodeSymbol(code), code });
    }
    if (this.letterDone && !this.spaceDone && silence >= this.unit * 7) {
      this.spaceDone = true;
      events.push({ type: 'space' });
    }
    return events;
  }

  reset(): void {
    this.code = '';
    this.pressedAt = null;
    this.lastReleaseAt = null;
    this.letterDone = false;
    this.spaceDone = false;
  }
}
