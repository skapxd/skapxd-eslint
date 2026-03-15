import type { Linter } from "eslint";
import { recommended } from "./index.js";

export const nestjs: Linter.Config[] = [
  ...recommended,
  {
    rules: {
      "@skapxd/max-public-methods": ["error", { max: 1 }],
      "@skapxd/no-value-imports": [
        "error",
        {
          allowedSources: [
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
          ],
          allowedPatterns: [
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
          ],
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "SwitchStatement",
          message: "Usa match() de ts-pattern en lugar de switch/case.",
        },
        {
          selector: "ConditionalExpression > ConditionalExpression",
          message:
            "Usa match() de ts-pattern en lugar de ternarios anidados.",
        },
        {
          selector: "NewExpression[callee.name='Date']",
          message:
            "Usa DateTime.now() o DateTime.fromISO() de Luxon en lugar de new Date().",
        },
        {
          selector: "MemberExpression[object.name='Date']",
          message:
            "Usa DateTime de Luxon en lugar de Date.now(), Date.parse(), etc.",
        },
        {
          selector: "TryStatement",
          message:
            "Usa trySafe() de @skapxd/result en lugar de try/catch.",
        },
      ],
      "check-file/filename-naming-convention": [
        "error",
        { "**/*.{ts,tsx}": "KEBAB_CASE" },
      ],
    },
  },
];
