import type { Linter } from "eslint";
import { recommended } from "./index.js";

export const nextjs: Linter.Config[] = [
  ...recommended,
  {
    rules: {
      "@skapxd/one-jsx-per-file": "warn",
      "react/no-unstable-nested-components": ["error", { allowAsProps: true }],
      "react/self-closing-comp": [
        "error",
        { component: true, html: true },
      ],
    },
  },
  {
    files: [
      "**/page.tsx",
      "**/layout.tsx",
      "**/loading.tsx",
      "**/error.tsx",
      "**/not-found.tsx",
      "**/template.tsx",
      "**/default.tsx",
      "eslint.config.mjs",
    ],
    rules: {
      "@skapxd/no-default-export": "off",
    },
  },
];
