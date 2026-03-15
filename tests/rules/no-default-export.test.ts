import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import { noDefaultExport } from "../../src/rules/no-default-export.js";

const tester = new RuleTester();

describe("no-default-export", () => {
  it("debe pasar con named exports", () => {
    tester.run("no-default-export", noDefaultExport, {
      valid: [
        { code: `export function App() {}` },
        { code: `export const x = 1;` },
        { code: `const x = 1; export { x };` },
        { code: `export { foo } from './bar';` },
      ],
      invalid: [],
    });
  });

  it("debe fallar con export default function", () => {
    tester.run("no-default-export", noDefaultExport, {
      valid: [],
      invalid: [
        {
          code: `export default function App() {}`,
          errors: [{ messageId: "noDefault" }],
        },
      ],
    });
  });

  it("debe fallar con export default class", () => {
    tester.run("no-default-export", noDefaultExport, {
      valid: [],
      invalid: [
        {
          code: `export default class MyClass {}`,
          errors: [{ messageId: "noDefault" }],
        },
      ],
    });
  });

  it("debe fallar con export default expression", () => {
    tester.run("no-default-export", noDefaultExport, {
      valid: [],
      invalid: [
        {
          code: `const x = 1; export default x;`,
          errors: [{ messageId: "noDefault" }],
        },
      ],
    });
  });
});
