import type { Rule } from "eslint";

const message = `La clase "{{ className }}" tiene {{ count }} metodos publicos, pero solo se permite un maximo de {{ max }}. Cada servicio debe tener una sola responsabilidad publica.

-- Instrucciones para corregir --
1. Identifica los metodos publicos de esta clase.
2. Conserva solo el metodo principal. Extrae los demas a servicios dedicados.
3. Nombra cada nuevo servicio de forma semantica (ej: si extraes "calcularInteres",
   crea "CalcularInteresService").
4. Inyecta los nuevos servicios via constructor en lugar de llamarlos directamente.
5. El objetivo es que cada servicio tenga una unica responsabilidad publica clara.`;

export const maxPublicMethods: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Limita la cantidad de metodos publicos por clase para forzar single responsibility.",
    },
    messages: {
      tooManyPublicMethods: message,
    },
    schema: [
      {
        type: "object",
        properties: {
          max: {
            type: "number",
          },
          excludeClasses: {
            type: "array",
            items: { type: "string" },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const options = context.options[0] as
      | { max?: number; excludeClasses?: string[] }
      | undefined;
    const max = options?.max ?? 1;
    const excludeClasses = options?.excludeClasses ?? [];

    return {
      ClassDeclaration(node) {
        const className =
          node.id?.name ?? "<anonima>";

        if (excludeClasses.includes(className)) {
          return;
        }

        let publicMethodCount = 0;

        for (const element of node.body.body) {
          if (element.type !== "MethodDefinition") continue;
          if (element.kind === "constructor") continue;

          const accessibility = (
            element as unknown as { accessibility?: string }
          ).accessibility;

          if (
            accessibility !== "private" &&
            accessibility !== "protected"
          ) {
            publicMethodCount++;
          }
        }

        if (publicMethodCount > max) {
          context.report({
            node,
            messageId: "tooManyPublicMethods",
            data: {
              className,
              count: String(publicMethodCount),
              max: String(max),
            },
          });
        }
      },
    };
  },
};
