import { describe, expect, it } from 'vitest';
import { decode, decodeSymbol, encode } from '../src/morse';

describe('encode', () => {
  it('traduce letras y palabras', () => {
    expect(encode('SOS')).toBe('... --- ...');
    expect(encode('hola mundo')).toBe('.... --- .-.. .- / -- ..- -. -.. ---');
  });
  it('traduce números y puntuación', () => {
    expect(encode('2026')).toBe('..--- ----- ..--- -....');
    expect(encode('¿Hola?')).toBe('.... --- .-.. .- ..--..');
  });
  it('ignora acentos, ñ y caracteres sin código', () => {
    expect(encode('Árbol ñu')).toBe('.- .-. -... --- .-.. / -. ..-');
    expect(encode('a#b')).toBe('.- -...');
  });
  it('devuelve vacío para entrada vacía', () => {
    expect(encode('   ')).toBe('');
  });
});

describe('decode', () => {
  it('es el inverso de encode', () => {
    for (const text of ['SOS', 'HOLA MUNDO', 'TEST 123', 'WHAT?']) {
      expect(decode(encode(text))).toBe(text);
    }
  });
  it('marca códigos desconocidos con ?', () => {
    expect(decodeSymbol('......--')).toBe('?');
    expect(decode('.- ......-- -...')).toBe('A?B');
  });
  it('acepta espacios extra', () => {
    expect(decode('  .-   -...  /  -.-. ')).toBe('AB C');
  });
});
