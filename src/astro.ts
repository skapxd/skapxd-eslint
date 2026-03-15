import type { Linter } from "eslint";
import { recommended } from "./index.js";

export const astro: Linter.Config[] = [
  ...recommended,
  {
    rules: {
      "@skapxd/one-jsx-per-file": "warn",
    },
  },
  {
    files: ["**/*.astro"],
    rules: {
      "@skapxd/no-default-export": "off",
    },
  },
];
