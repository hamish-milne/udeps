import { readFileSync, writeFileSync } from "node:fs";
import { isExportFunction, parseJs, printJs } from "./codeUtils.ts";

const fileName = process.argv[2];
const code = parseJs(readFileSync(fileName, "utf-8"));
const first = code.program.body[0];
const topComments = first.comments?.slice(undefined, -1);
first.comments = first.comments?.slice(-1);
code.program.body.sort((a, b) => {
  if (isExportFunction(a) && isExportFunction(b)) {
    return a.declaration.id.name.localeCompare(b.declaration.id.name);
  }
  return 0;
});
const newFirst = code.program.body[0];
newFirst.comments = [...(topComments || []), ...(newFirst.comments || [])];
writeFileSync(fileName, printJs(code));
