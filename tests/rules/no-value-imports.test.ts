import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import { noValueImports } from "../../src/rules/no-value-imports.js";
import tseslint from "typescript-eslint";

const tester = new RuleTester({
  languageOptions: {
    parser: tseslint.parser as unknown as RuleTester.Parser,
  },
});

describe("no-value-imports", () => {
  it("debe pasar con import type", () => {
    tester.run("no-value-imports", noValueImports, {
      valid: [
        {
          code: `import type { MyType } from '../other/module';`,
          filename: "my.service.ts",
        },
      ],
      invalid: [],
    });
  });

  it("debe pasar con import desde allowedSources", () => {
    tester.run("no-value-imports", noValueImports, {
      valid: [
        {
          code: `import { Injectable } from '@nestjs/common';`,
          filename: "my.service.ts",
        },
        {
          code: `import { match } from 'ts-pattern';`,
          filename: "my.service.ts",
        },
        {
          code: `import { Schema } from 'mongoose';`,
          filename: "my.service.ts",
        },
      ],
      invalid: [],
    });
  });

  it("debe pasar con import desde allowedPatterns", () => {
    tester.run("no-value-imports", noValueImports, {
      valid: [
        {
          code: `import { readFile } from 'node:fs';`,
          filename: "my.service.ts",
        },
        {
          code: `import { MyEnum } from './my.enum';`,
          filename: "my.service.ts",
        },
        {
          code: `import { helper } from '../utils/helper';`,
          filename: "my.service.ts",
        },
        {
          code: `import { mapper } from '../mappers/user';`,
          filename: "my.service.ts",
        },
      ],
      invalid: [],
    });
  });

  it("debe pasar en archivos que no son service", () => {
    tester.run("no-value-imports", noValueImports, {
      valid: [
        {
          code: `import { Something } from '../other/module';`,
          filename: "my.controller.ts",
        },
      ],
      invalid: [],
    });
  });

  it("debe fallar con import de valor desde modulo interno en archivo .service.ts", () => {
    tester.run("no-value-imports", noValueImports, {
      valid: [],
      invalid: [
        {
          code: `import { OtherService } from '../other/other.service';`,
          filename: "my.service.ts",
          errors: [{ messageId: "noValueImport" }],
        },
      ],
    });
  });

  it("debe fallar con import de valor desde modulo relativo no permitido", () => {
    tester.run("no-value-imports", noValueImports, {
      valid: [],
      invalid: [
        {
          code: `import { something } from '../features/payment';`,
          filename: "my.service.ts",
          errors: [{ messageId: "noValueImport" }],
        },
      ],
    });
  });

  it("debe pasar con inline type imports", () => {
    tester.run("no-value-imports", noValueImports, {
      valid: [
        {
          code: `import { type MyType } from '../other/module';`,
          filename: "my.service.ts",
        },
      ],
      invalid: [],
    });
  });
});
