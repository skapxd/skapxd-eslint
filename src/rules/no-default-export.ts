import type { Rule } from "eslint";

export const noDefaultExport: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Prohibir export default.",
    },
    messages: {
      noDefault: `No uses export default. Usa named exports (export function X / export const X).
Los default exports dificultan rastrear el origen de las importaciones en el editor.
Cambia "export default X" por "export function X" o "export const X".`,
    },
    schema: [],
  },
  create(context) {
    return {
      ExportDefaultDeclaration(node) {
        context.report({
          node,
          messageId: "noDefault",
        });
      },
    };
  },
};
