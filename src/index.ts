import type { Linter } from "eslint";
import tseslint from "typescript-eslint";
import { oneJsxPerFile } from "./rules/one-jsx-per-file.js";
import { noDefaultExport } from "./rules/no-default-export.js";
import { maxPublicMethods } from "./rules/max-public-methods.js";
import { noValueImports } from "./rules/no-value-imports.js";

export const plugin = {
  meta: {
    name: "@skapxd/eslint",
    version: "0.0.1",
  },
  rules: {
    "one-jsx-per-file": oneJsxPerFile,
    "no-default-export": noDefaultExport,
    "max-public-methods": maxPublicMethods,
    "no-value-imports": noValueImports,
  },
};

export const recommended: Linter.Config[] = [
  ...(tseslint.configs.recommended as Linter.Config[]),
  {
    plugins: {
      "@skapxd": plugin as unknown as Record<string, unknown>,
    },
    rules: {
      "@skapxd/no-default-export": "error",
      "no-implicit-coercion": [
        "error",
        { boolean: true, number: false, string: false },
      ],
      "object-shorthand": ["error", "always"],
      "prefer-template": "error",
      "no-restricted-globals": [
        "error",
        {
          name: "Date",
          message: "Usa DateTime de Luxon en lugar de Date.",
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
      ],
    },
  },
];

export { oneJsxPerFile } from "./rules/one-jsx-per-file.js";
export { noDefaultExport } from "./rules/no-default-export.js";
export { maxPublicMethods } from "./rules/max-public-methods.js";
export { noValueImports } from "./rules/no-value-imports.js";
