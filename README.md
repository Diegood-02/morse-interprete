# Intérprete Morse

Aplicación web que traduce código morse **en vivo** mientras escribes con la barra espaciadora, como un telégrafo.

## Cómo se usa

- Mantén **ESPACIO** (o el botón en pantalla, que también funciona en celular):
  - pulsación **corta** → punto (`•`)
  - pulsación **larga** → raya (`−`)
- Al soltar y esperar, el intérprete cierra la letra (≈ 3 unidades de silencio) y, si sigues esperando, la palabra (≈ 7 unidades).
- La **velocidad** (WPM) ajusta la unidad de tiempo: a más rápido, menos tiempo se necesita para distinguir punto de raya.
- Hay también un traductor **texto → morse** y una tabla de referencia.

## Desarrollo

```bash
npm install
npm run dev      # servidor local
npm test         # pruebas (Vitest)
npm run build    # build de producción en dist/
```

## Estructura

| Archivo | Qué hace |
|---|---|
| `src/morse.ts` | Tabla y funciones `encode` / `decode` (lógica pura) |
| `src/keyer.ts` | `Keyer`: convierte pulsaciones en puntos, rayas, letras y espacios |
| `src/main.ts` | Interfaz y eventos de teclado/puntero |
| `tests/` | Pruebas de `morse` y `keyer` |

Stack: TypeScript, Vite y Vitest, sin dependencias en producción. Se despliega en GitHub Pages con GitHub Actions.
