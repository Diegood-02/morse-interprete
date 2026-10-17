export const MORSE: Readonly<Record<string, string>> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....',
  I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.',
  Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
  Y: '-.--', Z: '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
  '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
  ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
  '"': '.-..-.', '$': '...-..-', '@': '.--.-.',
};

const REVERSE: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(MORSE).map(([char, code]) => [code, char]),
);

/** Quita acentos y pasa a mayúsculas; la ñ se trata como N. */
function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
}

/** Una letra por código separada por espacio; las palabras por " / ". Caracteres sin código se omiten. */
export function encode(text: string): string {
  return normalize(text)
    .split(/\s+/)
    .filter(Boolean)
    .map((word) =>
      [...word]
        .map((char) => MORSE[char])
        .filter((code): code is string => code !== undefined)
        .join(' '),
    )
    .filter(Boolean)
    .join(' / ');
}

/** Código de una sola letra → carácter, o '?' si no existe. */
export function decodeSymbol(code: string): string {
  return REVERSE[code] ?? '?';
}

/** Inverso de encode: letras separadas por espacio, palabras por "/". */
export function decode(morse: string): string {
  return morse
    .trim()
    .split(/\s*\/\s*/)
    .map((word) => word.split(/\s+/).filter(Boolean).map(decodeSymbol).join(''))
    .join(' ')
    .trim();
}
