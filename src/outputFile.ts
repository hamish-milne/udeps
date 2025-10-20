import { existsSync, readFileSync, writeFileSync } from "node:fs";
import type { namedTypes } from "ast-types";
import consola from "consola";
import { parse as jsParse, print } from "recast";
import * as typescriptParser from "recast/parsers/typescript.js";
import { cError, cInfo, cSuccess, cWarning } from "./colors.ts";
import { type FunctionEntry, stripTypes } from "./registry.ts";

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

function detectFileType(
  filePath: string,
  packageModule: "module" | "commonjs" | undefined,
): {
  language: "ts" | "js";
  module: "esm" | "cjs";
} {
  const isTypeScript = filePath.match(/\.[cm]?tsx?$/i);
  const isJavaScript = filePath.match(/\.[cm]?jsx?$/i);
  if (!isTypeScript && !isJavaScript) {
    consola.warn(
      `Could not detect file type for ${cWarning(filePath)}. Defaulting to JavaScript.`,
    );
  }
  const forceCjs = filePath.match(/\.(cjs|cts)x?$/i);
  const forceEsm = filePath.match(/\.(mjs|mts)x?$/i);
  if (
    !forceCjs &&
    !forceEsm &&
    packageModule !== "module" &&
    packageModule !== "commonjs"
  ) {
    consola.warn(
      `Could not detect module type for ${cWarning(filePath)}. Defaulting to ESM.`,
    );
  }
  return {
    language: isTypeScript ? "ts" : "js",
    module: forceCjs
      ? "cjs"
      : forceEsm
        ? "esm"
        : packageModule === "commonjs"
          ? "cjs"
          : "esm",
  };
}

export function insertIntoFile(filePath: string, entry: FunctionEntry) {
  const { language, module } = detectFileType(filePath, undefined);
  if (module === "cjs") {
    consola.error(
      `Cannot insert into CommonJS file ${cError(filePath)}. Only ESM files are supported.`,
    );
    return;
  }

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
          `Function ${cError(entry.name)} already exists in ${cInfo(filePath)}.`,
        );
        return;
      }
    }
  }
  const content = language === "ts" ? entry.content : stripTypes(entry.content);
  body.splice(i, 0, removeMetaDocTags(content));
  consola.debug(`Writing changes to ${cInfo(filePath)}.`);
  writeFileSync(filePath, print(fileAst).code);
}

export function removeFromFile(filePath: string, names: string[]) {
  if (!existsSync(filePath)) {
    consola.error(`File ${cInfo(filePath)} does not exist.`);
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
        `Function ${cWarning(name)} not found in ${cInfo(filePath)}`,
      );
      continue;
    }
    body.splice(index, 1);
    consola.success(
      `Function ${cSuccess(name)} removed from ${cInfo(filePath)}`,
    );
  }
  consola.debug(`Writing changes to ${cInfo(filePath)}.`);
  writeFileSync(filePath, print(fileAst).code);
}
