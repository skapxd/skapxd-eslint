import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import { maxPublicMethods } from "../../src/rules/max-public-methods.js";
import tseslint from "typescript-eslint";

const tester = new RuleTester({
  languageOptions: {
    parser: tseslint.parser as unknown as RuleTester.Parser,
  },
});

describe("max-public-methods", () => {
  it("debe pasar con una clase con 1 metodo publico", () => {
    tester.run("max-public-methods", maxPublicMethods, {
      valid: [
        {
          code: `
            class MyService {
              execute() { return 1; }
            }
          `,
        },
      ],
      invalid: [],
    });
  });

  it("debe pasar con metodos privados y protected", () => {
    tester.run("max-public-methods", maxPublicMethods, {
      valid: [
        {
          code: `
            class MyService {
              execute() { return 1; }
              private helper() { return 2; }
              protected another() { return 3; }
            }
          `,
        },
      ],
      invalid: [],
    });
  });

  it("debe pasar con clase en excludeClasses", () => {
    tester.run("max-public-methods", maxPublicMethods, {
      valid: [
        {
          code: `
            class LegacyService {
              methodA() { return 1; }
              methodB() { return 2; }
            }
          `,
          options: [{ excludeClasses: ["LegacyService"] }],
        },
      ],
      invalid: [],
    });
  });

  it("debe fallar con 2+ metodos publicos", () => {
    tester.run("max-public-methods", maxPublicMethods, {
      valid: [],
      invalid: [
        {
          code: `
            class MyService {
              methodA() { return 1; }
              methodB() { return 2; }
            }
          `,
          errors: [{ messageId: "tooManyPublicMethods" }],
        },
      ],
    });
  });

  it("debe fallar con metodos sin modificador de acceso (publico implicito)", () => {
    tester.run("max-public-methods", maxPublicMethods, {
      valid: [],
      invalid: [
        {
          code: `
            class MyService {
              doSomething() { return 1; }
              doAnother() { return 2; }
              doThird() { return 3; }
            }
          `,
          errors: [{ messageId: "tooManyPublicMethods" }],
        },
      ],
    });
  });

  it("debe ignorar el constructor", () => {
    tester.run("max-public-methods", maxPublicMethods, {
      valid: [
        {
          code: `
            class MyService {
              constructor() {}
              execute() { return 1; }
            }
          `,
        },
      ],
      invalid: [],
    });
  });

  it("debe respetar la opcion max custom", () => {
    tester.run("max-public-methods", maxPublicMethods, {
      valid: [
        {
          code: `
            class MyService {
              methodA() { return 1; }
              methodB() { return 2; }
              methodC() { return 3; }
            }
          `,
          options: [{ max: 3 }],
        },
      ],
      invalid: [],
    });
  });
});
