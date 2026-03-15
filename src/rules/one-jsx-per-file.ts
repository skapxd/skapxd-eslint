import type { Rule } from "eslint";

const message = `Este archivo contiene {{ count }} funciones que retornan JSX ({{ names }}), pero solo se permite una por archivo.

-- Instrucciones para corregir --
1. Identifica todas las funciones en este archivo que retornan JSX
   (componentes, helpers, builders, render functions, etc.).
2. Conserva SOLO la funcion principal que coincida con el nombre del archivo.
   Mueve todas las demas a su propio archivo.
3. Nombra cada archivo nuevo de forma semantica segun la funcion que contiene
   (ej: \`DocumentFileRow.tsx\`, \`FileActions.tsx\`).
4. Coloca los nuevos archivos en el mismo directorio o en un subdirectorio
   \`components/\` junto al archivo actual.
5. Importa las funciones extraidas de vuelta en el archivo original.
6. NO pases props excesivos hacia abajo (prop drilling). Si multiples componentes
   necesitan datos compartidos, usa uno de estos patrones:
   - Un store de Zustand con scope por feature/instancia
   - Un React Context provider que envuelva el limite de la feature
   - URL search params para estado que deba sobrevivir la navegacion
7. Cada archivo extraido debe usar named exports
   (export function X / export const X). NO usar export default.
8. El objetivo es que cualquier desarrollador (o agente LLM) pueda entender
   que hace un archivo solo leyendo su nombre, sin necesidad de abrirlo.`;

export const oneJsxPerFile: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Cada archivo puede tener como maximo una funcion que retorna JSX.",
    },
    messages: {
      tooManyJsxFunctions: message,
    },
    schema: [
      {
        type: "object",
        properties: {
          maxFunctions: {
            type: "number",
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const options = context.options[0] as { maxFunctions?: number } | undefined;
    const maxFunctions = options?.maxFunctions ?? 1;

    const jsxFunctions: { name: string; node: Rule.Node }[] = [];
    let programNode: Rule.Node | null = null;

    function containsJSX(node: unknown): boolean {
      if (!node || typeof node !== "object") return false;

      const n = node as Record<string, unknown>;
      const type = n["type"];

      if (type === "JSXElement" || type === "JSXFragment") {
        return true;
      }

      for (const key of Object.keys(n)) {
        if (key === "parent") continue;
        const value = n[key];
        if (value && typeof value === "object") {
          if (Array.isArray(value)) {
            for (const item of value) {
              if (containsJSX(item)) {
                return true;
              }
            }
          } else if (containsJSX(value)) {
            return true;
          }
        }
      }
      return false;
    }

    function getFunctionName(
      node: Rule.Node,
    ): string {
      if (node.type === "FunctionDeclaration" && node.id) {
        return node.id.name;
      }
      if (
        node.type === "VariableDeclarator" &&
        node.id &&
        node.id.type === "Identifier"
      ) {
        return node.id.name;
      }
      return "<anonima>";
    }

    function checkFunction(node: Rule.Node, nameNode: Rule.Node): void {
      if (containsJSX(node)) {
        jsxFunctions.push({
          name: getFunctionName(nameNode),
          node,
        });
      }
    }

    return {
      Program(node) {
        programNode = node as unknown as Rule.Node;
      },

      "Program > FunctionDeclaration"(node: Rule.Node) {
        checkFunction(node, node);
      },

      "Program > VariableDeclaration > VariableDeclarator"(
        node: Rule.Node & { init?: Rule.Node },
      ) {
        if (
          node.init &&
          (node.init.type === "ArrowFunctionExpression" ||
            node.init.type === "FunctionExpression")
        ) {
          checkFunction(node.init, node);
        }
      },

      "Program > ExportNamedDeclaration > FunctionDeclaration"(
        node: Rule.Node,
      ) {
        checkFunction(node, node);
      },

      "Program > ExportNamedDeclaration > VariableDeclaration > VariableDeclarator"(
        node: Rule.Node & { init?: Rule.Node },
      ) {
        if (
          node.init &&
          (node.init.type === "ArrowFunctionExpression" ||
            node.init.type === "FunctionExpression")
        ) {
          checkFunction(node.init, node);
        }
      },

      "Program:exit"() {
        if (jsxFunctions.length > maxFunctions && programNode) {
          const names = jsxFunctions.map((f) => f.name).join(", ");
          context.report({
            node: programNode,
            messageId: "tooManyJsxFunctions",
            data: {
              count: String(jsxFunctions.length),
              names,
            },
          });
        }
      },
    };
  },
};
