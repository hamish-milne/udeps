import { readFileSync, writeFileSync } from "node:fs";
import type { namedTypes } from "ast-types";
import { parse as parseJs, print } from "recast";
import * as typescriptParser from "recast/parsers/typescript.js";

const fileName = process.argv[2];
const code: namedTypes.File = parseJs(readFileSync(fileName, "utf-8"), {
  parser: typescriptParser,
});
const first = code.program.body[0];
const topComments = first.comments?.slice(undefined, -1);
first.comments = first.comments?.slice(-1);
code.program.body.sort((a, b) => {
  if (
    a.type === "ExportNamedDeclaration" &&
    a.declaration?.type === "FunctionDeclaration" &&
    typeof a.declaration.id?.name === "string" &&
    b.type === "ExportNamedDeclaration" &&
    b.declaration?.type === "FunctionDeclaration" &&
    typeof b.declaration.id?.name === "string"
  ) {
    return a.declaration.id.name.localeCompare(b.declaration.id.name);
  }
  return 0;
});
const newFirst = code.program.body[0];
newFirst.comments = [...(topComments || []), ...(newFirst.comments || [])];
writeFileSync(fileName, print(code).code);
