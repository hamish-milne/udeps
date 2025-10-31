import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { parse as docParse } from "comment-parser";
import { isExportFunction, parseJs, printJs } from "./codeUtils.ts";
import { parseTagProperties } from "./libSupport.ts";
import { type DeprecatedReason, getDocsUrl } from "./registry.ts";

mkdirSync("docs/registry", { recursive: true });
for (const file of readdirSync("registry")) {
  let markdownOut = "";
  if (file.endsWith(".ts") && !file.endsWith(".test.ts")) {
    markdownOut += `# ${file.slice(0, -3)}\n\n`;
    const source = parseJs(readFileSync(`registry/${file}`, "utf-8"));
    const moduleDoc = docParse(
      `/*${source.program.body[0]?.comments?.[0]?.value || ""}*/`,
    )[0];
    if (moduleDoc) {
      markdownOut += `${moduleDoc.description}\n\n`;
      const license = moduleDoc.tags.find((tag) => tag.tag === "license");
      if (license) {
        markdownOut += `**License:** [${license.name}](https://spdx.org/licenses/${license.name}.html)\n\n`;
      }
    }
    for (const node of source.program.body) {
      if (isExportFunction(node)) {
        const docComment = node.comments?.at(-1);
        if (docComment?.type === "CommentBlock") {
          const doc = docParse(`/*${docComment.value}*/`)[0];
          if (doc) {
            markdownOut += `## ${node.declaration.id.name}\n\n`;
            markdownOut += `${doc.description}\n\n`;
            const requiresTag = doc.tags
              .filter((tag) => tag.tag === "requires")
              .map((tag) => tag.name);
            if (requiresTag.find((x) => x.startsWith("DOM"))) {
              markdownOut += `> [!NOTE]\n> This function requires a browser.\n\n`;
            }
            if (requiresTag.find((x) => x.startsWith("node"))) {
              markdownOut += `> [!NOTE]\n> This function requires Node.js.\n\n`;
            }
            const esVersions = requiresTag
              .filter((x) => x.startsWith("ES"))
              .map((x) => Number(x.split(".")[0].slice(2)));
            const maxEsVersion = Math.max(...esVersions);
            if (maxEsVersion > 5) {
              markdownOut += `> [!NOTE]\n> This function requires ES${maxEsVersion}.\n\n`;
            }
            for (const tag of doc.tags) {
              if (tag.tag === "deprecated") {
                const reason = parseTagProperties<keyof DeprecatedReason>(tag);
                markdownOut += `> [!${reason.since || reason.inline === "recommend" ? "IMPORTANT" : "NOTE"}]\n> `;
                if (reason.since) {
                  markdownOut += `**Deprecated since ${reason.since.split(".")[0]}.** `;
                }
                if (reason["replace-with"]) {
                  markdownOut += `Use [${reason["replace-with"]}](${getDocsUrl(reason["replace-with"])}) instead. `;
                }
                if (reason.inline === "recommend") {
                  markdownOut += `You should inline this function instead of importing it.`;
                }
                if (reason.inline && reason.inline !== "recommend") {
                  markdownOut += `Consider inlining this function.`;
                }
                markdownOut += `\n\n`;
              }
            }
            markdownOut += "```ts\n";
            markdownOut += `${printJs(node.declaration)}\n`;
            markdownOut += "```\n\n";
          }
        }
      }
    }
    writeFileSync(`docs/registry/${file.slice(0, -3)}.md`, markdownOut);
  }
}
