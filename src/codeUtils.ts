import type { ASTNode, namedTypes } from "ast-types";
import { parse, print, visit } from "recast";
import * as typescriptParser from "recast/parsers/typescript.js";

export function parseJs(source: string): namedTypes.File {
  return parse(source, {
    parser: typescriptParser,
  });
}

export function printJs(ast: ASTNode): string {
  return print(ast, { lineTerminator: "\n" }).code;
}

export function printInline(func: namedTypes.FunctionDeclaration) {
  const body = func.body.body;
  if (
    body.length === 1 &&
    body[0].type === "ReturnStatement" &&
    body[0].argument
  ) {
    return printJs(stripTypes(body[0].argument));
  }
  return null;
}

export function stripTypes<T extends ASTNode>(node: T): T {
  return visit(node, {
    visitTSTypeAnnotation(path) {
      path.prune();
      return false;
    },
    visitTSParameterProperty(path) {
      path.replace(path.node.parameter);
      this.traverse(path);
    },
    visitTSAsExpression(path) {
      path.replace(path.node.expression);
      this.traverse(path);
    },
    visitTSTypeAssertion(path) {
      path.replace(path.node.expression);
      this.traverse(path);
    },
    visitTSTypeParameterDeclaration(path) {
      path.prune();
      return false;
    },
  });
}

export function isExportFunction(
  node: namedTypes.ASTNode,
): node is namedTypes.ExportNamedDeclaration & {
  declaration: namedTypes.FunctionDeclaration & {
    id: namedTypes.Identifier;
  };
} {
  return (
    node.type === "ExportNamedDeclaration" &&
    node.declaration?.type === "FunctionDeclaration" &&
    node.declaration.id?.type === "Identifier"
  );
}
