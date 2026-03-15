import type { Rule } from "eslint";

const message = `Los servicios no deben importar valores de "{{ source }}". Usa "import type { ... }" para tipos, e inyecta dependencias de valores via constructor (DI de NestJS).

-- Instrucciones para corregir --
1. Cambia "import { X } from '{{ source }}'" por "import type { X } from '{{ source }}'".
2. Si necesitas el valor en runtime, crea un servicio dedicado para esa funcionalidad
   e inyectalo via constructor.
3. Las importaciones de valor estan permitidas solo desde: librerias externas configuradas,
   archivos .enum, .schema, .dto, .constant, y utilidades (/utils/, /fn/).`;

const defaultAllowedSources = [
  "@nestjs/common",
  "@nestjs/mongoose",
  "@nestjs/config",
  "@opentelemetry/api",
  "ts-pattern",
  "mongoose",
  "axios",
  "luxon",
  "date-fns",
  "date-fns/locale",
  "mjml",
  "prettier",
  "swagger-typescript-api",
  "async_hooks",
  "rxjs",
  "glob",
  "mime-types",
];

const defaultAllowedPatterns = [
  "^node:",
  "^fs$",
  "^path$",
  "^crypto$",
  "\\.enum",
  "\\.schema",
  "\\.dto",
  "\\.constant",
  "\\.mock",
  "/mock/",
  "/utils?/",
  "/fn/",
  "/functions?/",
  "/mappers?/",
  "/token",
  "/types(/|$)",
  "/decorators?/",
  "/api/",
  "@skapxd/",
];

export const noValueImports: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Solo permite type imports en archivos de servicio (.service.ts).",
    },
    messages: {
      noValueImport: message,
    },
    schema: [
      {
        type: "object",
        properties: {
          allowedSources: {
            type: "array",
            items: { type: "string" },
          },
          allowedPatterns: {
            type: "array",
            items: { type: "string" },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();

    if (!filename.endsWith(".service.ts")) {
      return {};
    }

    const options = context.options[0] as
      | { allowedSources?: string[]; allowedPatterns?: string[] }
      | undefined;
    const allowedSources = options?.allowedSources ?? defaultAllowedSources;
    const allowedPatterns = options?.allowedPatterns ?? defaultAllowedPatterns;

    const compiledPatterns = allowedPatterns.map(
      (pattern) => new RegExp(pattern),
    );

    function isAllowed(source: string): boolean {
      if (allowedSources.includes(source)) {
        return true;
      }
      return compiledPatterns.some((regex) => regex.test(source));
    }

    return {
      ImportDeclaration(node) {
        if ((node as unknown as { importKind?: string }).importKind === "type") {
          return;
        }

        const allSpecifiersAreType = node.specifiers.every(
          (specifier) =>
            specifier.type === "ImportSpecifier" &&
            (specifier as unknown as { importKind?: string }).importKind ===
              "type",
        );
        if (allSpecifiersAreType) {
          return;
        }

        const source = node.source.value as string;

        if (!isAllowed(source)) {
          context.report({
            node,
            messageId: "noValueImport",
            data: { source },
          });
        }
      },
    };
  },
};
