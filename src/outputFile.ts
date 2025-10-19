import { existsSync, readFileSync, writeFileSync } from "node:fs";
import type { namedTypes } from "ast-types";
import consola from "consola";
import { colorize } from "consola/utils";
import { parse as jsParse, print } from "recast";
import * as typescriptParser from "recast/parsers/typescript.js";
import type { FunctionEntry } from "./registry.ts";

function removeMetaDocTags(func: namedTypes.ExportNamedDeclaration) {
  for (const comment of func.comments || []) {
    if (comment.type === "CommentBlock") {
      comment.value = comment.value.replace(
        /^\s*\*\s*@(?:requires|deprecated).*\r?\n/gm,
        "",
      );
    }
  }
  return func;
}

export function insertIntoFile(filePath: string, entry: FunctionEntry) {
  const fileContent = existsSync(filePath)
    ? readFileSync(filePath, "utf-8")
    : "";
  const fileAst: namedTypes.File = jsParse(fileContent, {
    parser: typescriptParser,
  });
  const { body } = fileAst.program;
  let i = 0;
  for (i = 0; i < body.length; i++) {
    const node = body[i];
    if (
      node.type === "ExportNamedDeclaration" &&
      node.declaration?.type === "FunctionDeclaration" &&
      node.declaration.id
    ) {
      if (node.declaration.id.name > entry.name) {
        break;
      }
      if (node.declaration.id.name === entry.name) {
        consola.error(
          `Function ${colorize("red", entry.name)} already exists in ${colorize("cyan", filePath)}.`,
        );
        return;
      }
    }
  }
  body.splice(i, 0, removeMetaDocTags(entry.content));
  consola.verbose(`Writing changes to ${colorize("cyan", filePath)}.`);
  writeFileSync(filePath, print(fileAst).code);
}

export function removeFromFile(filePath: string, names: string[]) {
  if (!existsSync(filePath)) {
    consola.error(`File ${colorize("cyan", filePath)} does not exist.`);
    return;
  }
  const fileAst: namedTypes.File = jsParse(readFileSync(filePath, "utf-8"), {
    parser: typescriptParser,
  });
  const { body } = fileAst.program;
  for (const name of names) {
    const index = body.findIndex(
      (node) =>
        node.type === "ExportNamedDeclaration" &&
        node.declaration?.type === "FunctionDeclaration" &&
        node.declaration.id?.name === name,
    );
    if (index === -1) {
      consola.warn(
        `Function ${colorize("yellow", name)} not found in ${colorize("cyan", filePath)}`,
      );
      continue;
    }
    body.splice(index, 1);
    consola.success(
      `Function ${colorize("green", name)} removed from ${colorize("cyan", filePath)}`,
    );
  }
  consola.verbose(`Writing changes to ${colorize("cyan", filePath)}.`);
  writeFileSync(filePath, print(fileAst).code);
}
