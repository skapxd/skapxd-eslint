import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import { oneJsxPerFile } from "../../src/rules/one-jsx-per-file.js";

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
        {
          code: `const helper = (x) => x * 2;\nfunction App() { return <div />; }`,
        },
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

  it("debe fallar con mezcla de function declarations y arrow functions con JSX", () => {
    tester.run("one-jsx-per-file", oneJsxPerFile, {
      valid: [],
      invalid: [
        {
          code: `
            function App() { return <div />; }
            const Other = () => <span />;
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

  it("debe funcionar con exported functions", () => {
    tester.run("one-jsx-per-file", oneJsxPerFile, {
      valid: [],
      invalid: [
        {
          code: `
            export function App() { return <div />; }
            export function Other() { return <span />; }
          `,
          errors: [{ messageId: "tooManyJsxFunctions" }],
        },
      ],
    });
  });

  it("debe funcionar con exported arrow functions", () => {
    tester.run("one-jsx-per-file", oneJsxPerFile, {
      valid: [],
      invalid: [
        {
          code: `
            export const App = () => <div />;
            export const Other = () => <span />;
          `,
          errors: [{ messageId: "tooManyJsxFunctions" }],
        },
      ],
    });
  });

  it("debe pasar cuando no hay funciones JSX", () => {
    tester.run("one-jsx-per-file", oneJsxPerFile, {
      valid: [
        { code: `const x = 1;\nfunction helper() { return 42; }` },
      ],
      invalid: [],
    });
  });
});
