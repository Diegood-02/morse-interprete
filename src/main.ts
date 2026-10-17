import './style.css';
import { Keyer } from './keyer';
import { MORSE, encode } from './morse';

const $ = <T extends HTMLElement>(id: string): T => {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Falta #${id}`);
  return el as T;
};

const keyEl = $<HTMLButtonElement>('key');
const pendingEl = $('pending');
const textEl = $('text');
const morseEl = $('morse');
const speedEl = $<HTMLInputElement>('speed');
const wpmEl = $('wpm');
const encIn = $<HTMLTextAreaElement>('encIn');
const encOut = $('encOut');
const chartEl = $('chart');

const keyer = new Keyer(Number(speedEl.value));
// Cada elemento es una letra con su código, o un espacio entre palabras (code '/').
const items: { char: string; code: string }[] = [];

// Puntos y rayas con glifos más legibles en pantalla.
const glyphs = (code: string) => code.replace(/\./g, '•').replace(/-/g, '−');

function render(): void {
  pendingEl.textContent = keyer.pending ? glyphs(keyer.pending) : ' ';
  const caret = Object.assign(document.createElement('span'), { className: 'caret' });
  textEl.replaceChildren(document.createTextNode(items.map((i) => i.char).join('')), caret);
  morseEl.textContent = glyphs(items.map((i) => i.code).join(' '));
}

function press(): void {
  if (keyer.isDown) return;
  keyer.press(performance.now());
  keyEl.classList.add('down');
}

function release(): void {
  if (!keyer.isDown) return;
  keyer.release(performance.now());
  keyEl.classList.remove('down');
  render();
}

function tick(): void {
  for (const ev of keyer.tick(performance.now())) {
    if (ev.type === 'letter') {
      items.push({ char: ev.char, code: ev.code });
    } else if (ev.type === 'space' && items.length && items.at(-1)?.char !== ' ') {
      items.push({ char: ' ', code: '/' });
    }
  }
  render();
}

const isEditable = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

// Teclado: la barra espaciadora es la tecla de telégrafo (salvo al escribir en un campo de texto).
window.addEventListener('keydown', (e) => {
  if (e.code !== 'Space' || isEditable(e.target)) return;
  e.preventDefault();
  if (!e.repeat) press();
});

window.addEventListener('keyup', (e) => {
  if (e.code !== 'Space' || isEditable(e.target)) return;
  e.preventDefault();
  release();
});

// Ratón y pantalla táctil sobre el botón.
keyEl.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  keyEl.setPointerCapture(e.pointerId);
  press();
});
keyEl.addEventListener('pointerup', release);
keyEl.addEventListener('pointercancel', release);
// El botón no debe activarse con Espacio/Enter como un clic normal (ya lo manejamos arriba).
keyEl.addEventListener('keydown', (e) => { if (e.code === 'Space' || e.code === 'Enter') e.preventDefault(); });
window.addEventListener('blur', () => { keyer.reset(); keyEl.classList.remove('down'); render(); });

// Controles
function updateSpeed(): void {
  keyer.unit = Number(speedEl.value);
  wpmEl.textContent = `${Math.round(1200 / keyer.unit)} WPM`;
}
speedEl.addEventListener('input', updateSpeed);
updateSpeed();

$('clear').addEventListener('click', () => {
  items.length = 0;
  keyer.reset();
  render();
});

$('backspace').addEventListener('click', () => {
  items.pop();
  render();
});

$('copy').addEventListener('click', async (ev) => {
  const btn = ev.currentTarget as HTMLButtonElement;
  try {
    await navigator.clipboard.writeText(items.map((i) => i.char).join(''));
    btn.textContent = '¡Copiado!';
  } catch {
    btn.textContent = 'No se pudo copiar';
  }
  setTimeout(() => { btn.textContent = 'Copiar'; }, 1400);
});

// Texto → Morse
encIn.addEventListener('input', () => {
  encOut.textContent = glyphs(encode(encIn.value));
});

// Tabla de referencia
for (const [char, code] of Object.entries(MORSE)) {
  const item = document.createElement('div');
  const b = document.createElement('b');
  b.textContent = char;
  const s = document.createElement('span');
  s.textContent = glyphs(code);
  item.append(b, s);
  chartEl.append(item);
}

setInterval(tick, 30);
render();
