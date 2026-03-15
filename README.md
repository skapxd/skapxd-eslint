# @skapxd/eslint

Reglas y presets de ESLint opinados para guiar agentes de IA y desarrolladores hacia codigo limpio, rastreable y mantenible.

Compatible con ESLint 9+ (flat config).

## Instalacion

```bash
yarn add -D @skapxd/eslint eslint typescript-eslint
```

## Uso

### Base TypeScript

```js
// eslint.config.mjs
import { recommended } from "@skapxd/eslint";

export default [...recommended];
```

### Next.js

```bash
yarn add -D eslint-plugin-react eslint-plugin-react-hooks @next/eslint-plugin-next
```

```js
// eslint.config.mjs
import { nextjs } from "@skapxd/eslint/nextjs";

export default [...nextjs];
```

### NestJS

```bash
yarn add -D eslint-plugin-check-file eslint-config-prettier
```

```js
// eslint.config.mjs
import { nestjs } from "@skapxd/eslint/nestjs";

export default [...nestjs];
```

### Astro

```bash
yarn add -D eslint-plugin-astro
```

```js
// eslint.config.mjs
import { astro } from "@skapxd/eslint/astro";

export default [...astro];
```

## Reglas custom

### `@skapxd/one-jsx-per-file`

- **Tipo**: warning
- **Presets**: nextjs, astro
- **Opciones**: `{ maxFunctions: number }` (default: 1)

Cada archivo puede tener como maximo una funcion que retorna JSX. Fuerza la separacion de componentes en archivos individuales para mejorar la legibilidad y rastreabilidad.

### `@skapxd/no-default-export`

- **Tipo**: error
- **Presets**: todos

Prohibe `export default`. Los named exports facilitan rastrear el origen de las importaciones en el editor.

Se desactiva automaticamente en archivos especiales de Next.js (`page.tsx`, `layout.tsx`, etc.) y archivos `.astro`.

### `@skapxd/max-public-methods`

- **Tipo**: error
- **Presets**: nestjs
- **Opciones**: `{ max: number, excludeClasses: string[] }` (default max: 1)

Limita la cantidad de metodos publicos por clase para forzar single responsibility. Cada servicio debe tener una unica responsabilidad publica clara.

```js
"@skapxd/max-public-methods": ["error", {
  max: 1,
  excludeClasses: ["LegacyService"]
}]
```

### `@skapxd/no-value-imports`

- **Tipo**: error
- **Presets**: nestjs (solo en archivos `*.service.ts`)
- **Opciones**: `{ allowedSources: string[], allowedPatterns: string[] }`

Solo permite `import type { ... }` en archivos de servicio. Las dependencias de valores deben inyectarse via constructor (DI de NestJS). Se permiten importaciones de valor desde librerias externas configuradas y archivos de infraestructura (`.enum`, `.schema`, `.dto`, `.constant`, `/utils/`, `/fn/`).

## Reglas incluidas del ecosistema

El preset `recommended` tambien activa:

| Regla | Configuracion |
|-------|--------------|
| `no-implicit-coercion` | Solo boolean |
| `object-shorthand` | always |
| `prefer-template` | error |
| `no-restricted-globals` | `Date` → usar Luxon |
| `no-restricted-syntax` | `switch` → ts-pattern, ternarios anidados → ts-pattern, `new Date()` → Luxon |

El preset `nestjs` agrega ademas:

| Regla | Configuracion |
|-------|--------------|
| `no-restricted-syntax` | `try/catch` → usar `trySafe()` de `@skapxd/result` |
| `check-file/filename-naming-convention` | KEBAB_CASE para `.ts` y `.tsx` |

## Principios de diseno

1. **Mensajes como prompts**: Cada mensaje de error es una instruccion paso a paso que un agente LLM puede leer y ejecutar para corregir el problema automaticamente.
2. **Mensajes en espanol**: Todos los mensajes de retroalimentacion en espanol.
3. **Un solo reporte por archivo**: Las reglas que detectan multiples violaciones reportan una sola vez con la lista completa.
4. **Opinado pero configurable**: Los presets vienen con defaults estrictos pero cada regla acepta opciones para ajustar umbrales o exclusiones.

## Licencia

MIT
