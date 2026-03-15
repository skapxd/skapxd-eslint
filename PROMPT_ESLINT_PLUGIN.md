# Prompt: Crear @skapxd/eslint

## Objetivo

Crear un paquete npm `@skapxd/eslint` que centralice reglas custom de ESLint y presets de
configuracion por framework/tecnologia. El paquete es personal (no atado a una empresa) y
representa preferencias de desarrollo que guian a agentes de IA y desarrolladores hacia
codigo limpio, rastreable y mantenible.

Debe funcionar con ESLint 9+ (flat config) y permitir imports por framework:

```js
import { recommended } from "@skapxd/eslint";          // Base TypeScript
import { nextjs } from "@skapxd/eslint/nextjs";        // Next.js / React
import { nestjs } from "@skapxd/eslint/nestjs";        // NestJS
import { astro } from "@skapxd/eslint/astro";          // Astro
```

## Estructura del repositorio

```
@skapxd/eslint/
  src/
    rules/
      one-jsx-per-file.ts       # Max 1 funcion con JSX por archivo
      no-default-export.ts      # Prohibir export default
      max-public-methods.ts     # Max metodos publicos por clase
      no-value-imports.ts       # Solo type imports en servicios
    index.ts                    # Export: recommended
    nextjs.ts                   # Export: nextjs (extiende recommended)
    nestjs.ts                   # Export: nestjs (extiende recommended)
    astro.ts                    # Export: astro (extiende recommended)
  tests/
    rules/
      one-jsx-per-file.test.ts
      no-default-export.test.ts
      max-public-methods.test.ts
      no-value-imports.test.ts
  package.json
  tsconfig.json
  vitest.config.ts
  README.md
```

---

## Archivos de configuracion del proyecto

### package.json

```json
{
  "name": "@skapxd/eslint",
  "version": "0.0.1",
  "description": "Reglas y presets de ESLint opinados para guiar agentes de IA y desarrolladores hacia codigo limpio, rastreable y mantenible.",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./nextjs": {
      "types": "./dist/nextjs.d.ts",
      "import": "./dist/nextjs.js"
    },
    "./nestjs": {
      "types": "./dist/nestjs.d.ts",
      "import": "./dist/nestjs.js"
    },
    "./astro": {
      "types": "./dist/astro.d.ts",
      "import": "./dist/astro.js"
    }
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src/",
    "prepublishOnly": "npm run build"
  },
  "peerDependencies": {
    "eslint": ">=9.0.0",
    "typescript-eslint": ">=8.0.0"
  },
  "peerDependenciesMeta": {
    "eslint-plugin-react": { "optional": true },
    "eslint-plugin-react-hooks": { "optional": true },
    "@next/eslint-plugin-next": { "optional": true },
    "eslint-plugin-astro": { "optional": true },
    "eslint-plugin-check-file": { "optional": true },
    "eslint-config-prettier": { "optional": true }
  },
  "devDependencies": {
    "eslint": "^9.0.0",
    "typescript": "^5.5.0",
    "typescript-eslint": "^8.0.0",
    "tsup": "^8.0.0",
    "vitest": "^3.0.0",
    "@types/eslint": "^9.0.0",
    "eslint-plugin-react": "^7.0.0",
    "eslint-plugin-react-hooks": "^5.0.0",
    "@next/eslint-plugin-next": "^15.0.0",
    "eslint-plugin-astro": "^1.0.0",
    "eslint-plugin-check-file": "^2.0.0",
    "eslint-config-prettier": "^10.0.0"
  },
  "keywords": [
    "eslint",
    "eslint-plugin",
    "eslint-config",
    "typescript",
    "nextjs",
    "nestjs",
    "astro",
    "ai-agents",
    "code-quality"
  ],
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/skapxd/eslint"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### vitest.config.ts

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: ["tests/**/*.test.ts"],
  },
});
```

### tsup.config.ts (bundler)

```typescript
import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/nextjs.ts",
    "src/nestjs.ts",
    "src/astro.ts",
  ],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: true,
  outDir: "dist",
});
```

## Principios de diseno

1. **Mensajes como prompts**: Cada mensaje de error debe ser una instruccion paso a paso
   que un agente LLM pueda leer y ejecutar para corregir el problema automaticamente.
2. **Mensajes en espanol**: Todos los mensajes de retroalimentacion en espanol.
3. **Un solo reporte por archivo**: Las reglas que detectan multiples violaciones en un
   archivo deben reportar UNA sola vez con la lista completa, no una vez por violacion.
4. **Opinado pero configurable**: Los presets vienen con defaults estrictos pero cada
   regla acepta opciones para ajustar umbrales o exclusiones.

---

## Reglas custom a implementar

### 1. `@skapxd/one-jsx-per-file`

- **Tipo**: warning
- **Aplica en**: nextjs, astro
- **Que hace**: Cada archivo puede tener como maximo una funcion que retorna JSX.
  Recorre el AST, cuenta funciones top-level (FunctionDeclaration, FunctionExpression,
  ArrowFunctionExpression) que contienen JSXElement o JSXFragment en su cuerpo.
  Si hay mas de `maxFunctions`, reporta UNA VEZ en el nodo Program (linea 1).
- **Opciones**: `{ maxFunctions: number }` (default: 1)
- **Mensaje**:
  ```
  Este archivo contiene {{ count }} funciones que retornan JSX ({{ names }}),
  pero solo se permite una por archivo.

  -- Instrucciones para corregir --
  1. Identifica todas las funciones en este archivo que retornan JSX
     (componentes, helpers, builders, render functions, etc.).
  2. Conserva SOLO la funcion principal que coincida con el nombre del archivo.
     Mueve todas las demas a su propio archivo.
  3. Nombra cada archivo nuevo de forma semantica segun la funcion que contiene
     (ej: `DocumentFileRow.tsx`, `FileActions.tsx`).
  4. Coloca los nuevos archivos en el mismo directorio o en un subdirectorio
     `components/` junto al archivo actual.
  5. Importa las funciones extraidas de vuelta en el archivo original.
  6. NO pases props excesivos hacia abajo (prop drilling). Si multiples componentes
     necesitan datos compartidos, usa uno de estos patrones:
     - Un store de Zustand con scope por feature/instancia
     - Un React Context provider que envuelva el limite de la feature
     - URL search params para estado que deba sobrevivir la navegacion
  7. Cada archivo extraido debe usar named exports
     (export function X / export const X). NO usar export default.
  8. El objetivo es que cualquier desarrollador (o agente LLM) pueda entender
     que hace un archivo solo leyendo su nombre, sin necesidad de abrirlo.
  ```
- **Implementacion existente**: `vivienda-unibank-onboar/admin/eslint-rules/one-jsx-per-file.js`

### 2. `@skapxd/no-default-export`

- **Tipo**: error
- **Aplica en**: Todos los presets
- **Que hace**: Prohibe `export default`. Detecta nodo AST `ExportDefaultDeclaration`.
- **Mensaje**:
  ```
  No uses export default. Usa named exports (export function X / export const X).
  Los default exports dificultan rastrear el origen de las importaciones en el editor.
  Cambia "export default X" por "export function X" o "export const X".
  ```
- **Nota para presets de frameworks con archivos especiales**:
  - **Next.js**: Desactivar en `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`,
    `not-found.tsx`, `template.tsx`, `default.tsx`
  - **Astro**: Desactivar en `*.astro` (Astro requiere default export en pages)
  - **NestJS**: Sin excepciones
- **Implementacion existente**: `vivienda-unibank-onboar/admin/eslint-rules/no-default-export.js`

### 3. `@skapxd/max-public-methods`

- **Tipo**: error
- **Aplica en**: nestjs
- **Que hace**: Limita la cantidad de metodos publicos por clase para forzar
  single responsibility. Recorre `MethodDefinition` dentro de `ClassBody`,
  cuenta los que tienen `accessibility !== 'private' && accessibility !== 'protected'`
  y no son constructores. Si exceden el maximo, reporta en el nodo de la clase.
- **Opciones**: `{ max: number, excludeClasses: string[] }` (default max: 1, excludeClasses: [])
- **Mensaje**:
  ```
  La clase "{{ className }}" tiene {{ count }} metodos publicos, pero solo se permite
  un maximo de {{ max }}. Cada servicio debe tener una sola responsabilidad publica.

  -- Instrucciones para corregir --
  1. Identifica los metodos publicos de esta clase.
  2. Conserva solo el metodo principal. Extrae los demas a servicios dedicados.
  3. Nombra cada nuevo servicio de forma semantica (ej: si extraes "calcularInteres",
     crea "CalcularInteresService").
  4. Inyecta los nuevos servicios via constructor en lugar de llamarlos directamente.
  5. El objetivo es que cada servicio tenga una unica responsabilidad publica clara.
  ```
- **Implementacion existente**: `vivienda-unibank-onboar/back/eslint-rules/max-public-methods.cjs`

### 4. `@skapxd/no-value-imports`

- **Tipo**: error
- **Aplica en**: nestjs, solo en archivos `*.service.ts`
- **Que hace**: Dentro de archivos de servicio, solo permite `import type { ... }`
  para importaciones de otros modulos internos. Las dependencias de valores deben
  inyectarse via constructor (DI). Se permiten importaciones de valor de librerias
  externas y archivos de infraestructura configurables.
- **Opciones**:
  ```json
  {
    "allowedSources": [
      "@nestjs/common", "@nestjs/mongoose", "@nestjs/config",
      "@opentelemetry/api", "ts-pattern", "mongoose", "axios",
      "luxon", "date-fns", "date-fns/locale", "mjml", "prettier",
      "swagger-typescript-api", "async_hooks", "rxjs", "glob", "mime-types"
    ],
    "allowedPatterns": [
      "^node:", "^fs$", "^path$", "^crypto$",
      "\\.enum", "\\.schema", "\\.dto", "\\.constant",
      "\\.mock", "/mock/",
      "/utils?/", "/fn/", "/functions?/", "/mappers?/",
      "/token", "/types(/|$)", "/decorators?/", "/api/",
      "@skapxd/"
    ]
  }
  ```
- **Mensaje**:
  ```
  Los servicios no deben importar valores de "{{ source }}". Usa "import type { ... }"
  para tipos, e inyecta dependencias de valores via constructor (DI de NestJS).

  -- Instrucciones para corregir --
  1. Cambia "import { X } from '{{ source }}'" por "import type { X } from '{{ source }}'".
  2. Si necesitas el valor en runtime, crea un servicio dedicado para esa funcionalidad
     e inyectalo via constructor.
  3. Las importaciones de valor estan permitidas solo desde: librerias externas configuradas,
     archivos .enum, .schema, .dto, .constant, y utilidades (/utils/, /fn/).
  ```
- **Implementacion existente**: `vivienda-unibank-onboar/back/eslint-rules/no-value-imports.cjs`

---

## Presets de configuracion

Cada preset exporta un array de objetos flat config listo para spread.

### `recommended` (import from `@skapxd/eslint`)

Base para cualquier proyecto TypeScript. Incluye:

```js
// Dependencias de config que debe incluir el preset:
// - typescript-eslint recommended

// Plugin propio registrado como "@skapxd"
// Reglas:
{
  "@skapxd/no-default-export": "error",
  "no-implicit-coercion": ["error", { boolean: true, number: false, string: false }],
  "object-shorthand": ["error", "always"],
  "prefer-template": "error",
  "no-restricted-globals": [
    "error",
    { name: "Date", message: "Usa DateTime de Luxon en lugar de Date." },
  ],
  "no-restricted-syntax": [
    "error",
    {
      selector: "SwitchStatement",
      message: "Usa match() de ts-pattern en lugar de switch/case.",
    },
    {
      selector: "ConditionalExpression > ConditionalExpression",
      message: "Usa match() de ts-pattern en lugar de ternarios anidados.",
    },
    {
      selector: "NewExpression[callee.name='Date']",
      message: "Usa DateTime.now() o DateTime.fromISO() de Luxon en lugar de new Date().",
    },
    {
      selector: "MemberExpression[object.name='Date']",
      message: "Usa DateTime de Luxon en lugar de Date.now(), Date.parse(), etc.",
    },
  ],
}
```

### `nextjs` (import from `@skapxd/eslint/nextjs`)

Extiende `recommended`. Agrega:

```js
// Dependencias de config que debe incluir el preset:
// - @next/eslint-plugin-next (recommended + core-web-vitals)
// - eslint-plugin-react
// - eslint-plugin-react-hooks

// Reglas adicionales:
{
  "@skapxd/one-jsx-per-file": "warn",
  "react/no-unstable-nested-components": ["error", { allowAsProps: true }],
  "react/self-closing-comp": ["error", { component: true, html: true }],
}

// Override: desactivar no-default-export en archivos especiales de Next.js
// files: ["**/page.tsx", "**/layout.tsx", "**/loading.tsx", "**/error.tsx",
//         "**/not-found.tsx", "**/template.tsx", "**/default.tsx",
//         "eslint.config.mjs"]
// rules: { "@skapxd/no-default-export": "off" }
```

### `nestjs` (import from `@skapxd/eslint/nestjs`)

Extiende `recommended`. Agrega:

```js
// Dependencias de config que debe incluir el preset:
// - typescript-eslint type-checked
// - eslint-plugin-check-file
// - eslint-config-prettier

// Reglas adicionales:
{
  "@skapxd/max-public-methods": ["error", { max: 1 }],
  "@skapxd/no-value-imports": ["error", {
    allowedSources: [
      "@nestjs/common", "@nestjs/mongoose", "@nestjs/config",
      "@opentelemetry/api", "ts-pattern", "mongoose", "axios",
      "luxon", "date-fns", "date-fns/locale", "mjml", "prettier",
      "swagger-typescript-api", "async_hooks", "rxjs", "glob", "mime-types"
    ],
    allowedPatterns: [
      "^node:", "^fs$", "^path$", "^crypto$",
      "\\.enum", "\\.schema", "\\.dto", "\\.constant",
      "\\.mock", "/mock/",
      "/utils?/", "/fn/", "/functions?/", "/mappers?/",
      "/token", "/types(/|$)", "/decorators?/", "/api/",
      "@skapxd/"
    ]
  }],
  "check-file/filename-naming-convention": ["error", { "**/*.{ts,tsx}": "KEBAB_CASE" }],
}

// Override: agregar TryStatement a no-restricted-syntax
// (ademas de los de recommended)
// {
//   selector: "TryStatement",
//   message: "Usa trySafe() de @skapxd/result en lugar de try/catch."
// }
```

### `astro` (import from `@skapxd/eslint/astro`)

Extiende `recommended`. Agrega:

```js
// Dependencias de config que debe incluir el preset:
// - eslint-plugin-astro

// Reglas adicionales:
{
  "@skapxd/one-jsx-per-file": "warn",
}

// Override: desactivar no-default-export en archivos .astro
// files: ["**/*.astro"]
// rules: { "@skapxd/no-default-export": "off" }
```

---

## Uso esperado en proyectos

### Next.js
```js
// eslint.config.mjs
import { nextjs } from "@skapxd/eslint/nextjs";

export default [
  ...nextjs,
  // overrides del proyecto
];
```

### NestJS
```js
// eslint.config.mjs
import { nestjs } from "@skapxd/eslint/nestjs";

export default [
  ...nestjs,
  {
    rules: {
      // excluir clases legacy
      "@skapxd/max-public-methods": ["error", {
        max: 1,
        excludeClasses: ["LegacyService"]
      }],
    },
  },
];
```

### Astro
```js
// eslint.config.mjs
import { astro } from "@skapxd/eslint/astro";

export default [
  ...astro,
];
```

### Solo base TypeScript
```js
// eslint.config.mjs
import { recommended } from "@skapxd/eslint";

export default [
  ...recommended,
];
```

---

## Requerimientos tecnicos

- Compatible con ESLint 9+ (flat config exclusivamente)
- Cada preset exporta un array de objetos config (para spread)
- Peer dependencies: eslint >= 9, typescript-eslint
- Plugins de framework como peer dependencies opcionales (eslint-plugin-react,
  @next/eslint-plugin-next, eslint-plugin-astro, eslint-plugin-check-file)
- Todos los mensajes de error en espanol
- Los mensajes sirven como prompts para agentes LLM (instrucciones paso a paso)
- Publicable en npm bajo scope `@skapxd`

## Testing

- **Runner**: Vitest
- **Lenguaje**: TypeScript
- **Herramienta**: `RuleTester` de ESLint
- Cada regla custom debe tener su archivo de test en `tests/rules/`

### Estructura de tests

```
tests/
  rules/
    one-jsx-per-file.test.ts
    no-default-export.test.ts
    max-public-methods.test.ts
    no-value-imports.test.ts
```

### Ejemplo de test

```typescript
import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import { oneJsxPerFile } from "../../src/rules/one-jsx-per-file";

const tester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },
});

describe("one-jsx-per-file", () => {
  it("debe pasar con una sola funcion JSX", () => {
    tester.run("one-jsx-per-file", oneJsxPerFile, {
      valid: [
        { code: `function App() { return <div />; }` },
        { code: `const helper = (x: number) => x * 2;\nfunction App() { return <div />; }` },
      ],
      invalid: [],
    });
  });

  it("debe fallar con multiples funciones JSX", () => {
    tester.run("one-jsx-per-file", oneJsxPerFile, {
      valid: [],
      invalid: [
        {
          code: `
            function App() { return <div />; }
            function Other() { return <span />; }
          `,
          errors: [{ messageId: "tooManyJsxFunctions" }],
        },
      ],
    });
  });

  it("debe ignorar funciones anidadas (no top-level)", () => {
    tester.run("one-jsx-per-file", oneJsxPerFile, {
      valid: [
        {
          code: `
            function App() {
              const renderItem = () => <li />;
              return <ul>{renderItem()}</ul>;
            }
          `,
        },
      ],
      invalid: [],
    });
  });

  it("debe respetar la opcion maxFunctions", () => {
    tester.run("one-jsx-per-file", oneJsxPerFile, {
      valid: [
        {
          code: `
            function A() { return <div />; }
            function B() { return <span />; }
          `,
          options: [{ maxFunctions: 2 }],
        },
      ],
      invalid: [],
    });
  });
});
```

### Casos de test requeridos por regla

**one-jsx-per-file**:
- Valid: 1 funcion JSX, funciones sin JSX, funciones anidadas con JSX, maxFunctions custom
- Invalid: 2+ funciones JSX top-level, mezcla de function declarations y arrow functions con JSX

**no-default-export**:
- Valid: named export function, named export const, export { X }, re-export nombrado
- Invalid: export default function, export default class, export default expression

**max-public-methods**:
- Valid: clase con 1 metodo publico, clase con metodos privados/protected, clase en excludeClasses
- Invalid: clase con 2+ metodos publicos, clase sin modificador de acceso (publico implicito)

**no-value-imports**:
- Valid: import type, import desde allowedSources, import desde allowedPatterns, import en archivos no-service
- Invalid: import de valor desde modulo interno en archivo .service.ts

## Reglas existentes a migrar

Las implementaciones actuales estan en el repositorio `vivienda-unibank-onboar`:

| Regla | Ubicacion actual |
|-------|-----------------|
| one-jsx-per-file | `admin/eslint-rules/one-jsx-per-file.js` |
| no-default-export | `admin/eslint-rules/no-default-export.js` |
| max-public-methods | `back/eslint-rules/max-public-methods.cjs` |
| no-value-imports | `back/eslint-rules/no-value-imports.cjs` |

Usar estas como base y adaptarlas al formato del plugin con el namespace `@skapxd`.
