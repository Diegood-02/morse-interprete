import { describe, expect, it } from 'vitest';
import { Keyer } from '../src/keyer';

const U = 100;

/** Pulsa durante `ms` a partir de `t`; devuelve el evento y el instante de liberación. */
function tap(k: Keyer, t: number, ms: number) {
  k.press(t);
  const ev = k.release(t + ms);
  return { ev, end: t + ms };
}

describe('Keyer', () => {
  it('distingue punto y raya por duración', () => {
    const k = new Keyer(U);
    expect(tap(k, 0, 80).ev).toEqual({ type: 'symbol', symbol: '.' });
    expect(tap(k, 200, 300).ev).toEqual({ type: 'symbol', symbol: '-' });
    expect(k.pending).toBe('.-');
  });

  it('emite la letra tras 3 unidades de silencio', () => {
    const k = new Keyer(U);
    const { end } = tap(k, 0, 80); // E = .
    expect(k.tick(end + U * 2)).toEqual([]);
    expect(k.tick(end + U * 3)).toEqual([{ type: 'letter', char: 'E', code: '.' }]);
    expect(k.pending).toBe('');
  });

  it('emite el espacio tras 7 unidades, una sola vez', () => {
    const k = new Keyer(U);
    const { end } = tap(k, 0, 300); // T = -
    k.tick(end + U * 3);
    expect(k.tick(end + U * 7)).toEqual([{ type: 'space' }]);
    expect(k.tick(end + U * 20)).toEqual([]);
  });

  it('una pausa larga seguida emite letra y espacio juntos', () => {
    const k = new Keyer(U);
    const { end } = tap(k, 0, 80);
    expect(k.tick(end + U * 10)).toEqual([
      { type: 'letter', char: 'E', code: '.' },
      { type: 'space' },
    ]);
  });

  it('no emite nada mientras la tecla está presionada', () => {
    const k = new Keyer(U);
    k.press(0);
    expect(k.tick(5000)).toEqual([]);
  });

  it('ignora presiones repetidas y releases sin press', () => {
    const k = new Keyer(U);
    expect(k.release(10)).toBeNull();
    k.press(0);
    k.press(50);
    expect(k.release(80)).toEqual({ type: 'symbol', symbol: '.' });
  });

  it('traduce una palabra completa (HI)', () => {
    const k = new Keyer(U);
    const out: string[] = [];
    let t = 0;
    for (const code of ['....', '..']) {
      for (const s of code) {
        const { end } = tap(k, t, s === '.' ? 80 : 300);
        t = end + U; // pausa entre símbolos de una misma letra
      }
      t += U * 3; // pausa entre letras
      for (const e of k.tick(t)) if (e.type === 'letter') out.push(e.char);
    }
    expect(out.join('')).toBe('HI');
  });
});
