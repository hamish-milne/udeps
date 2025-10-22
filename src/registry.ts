import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { namedTypes } from "ast-types";
import { type Block, parse as docParse } from "comment-parser";
import consola from "consola";
import { isExportFunction, parseJs, printInline } from "./codeUtils.ts";
import { cGray, cInfo, cStrong, cWarning } from "./colors.ts";
import type { UdepsConfig } from "./config.ts";

export interface FunctionEntry {
  name: string;
  doc: Block;
  content: namedTypes.ExportNamedDeclaration;
  function: namedTypes.FunctionDeclaration;
}

async function loadFileOrUrl(path: string, config: UdepsConfig) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    consola.debug(`Fetching registry from URL: ${cInfo(path)}`);
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
    }
    return await response.text();
  } else if (path.match(/^(?:\.\.?)[/\\]/)) {
    const fullPath = resolve(config.project, path);
    consola.debug(`Loading registry from file: ${cInfo(fullPath)}`);
    return await readFile(fullPath, "utf-8");
  } else {
    throw new Error(`Unsupported registry path: ${path}`);
  }
}

async function loadRegistry(path: string, config: UdepsConfig) {
  const registrySource = parseJs(await loadFileOrUrl(path, config));
  const [firstComment] = docParse(
    `/*${registrySource.program.body[0]?.comments?.[0]?.value || ""}*/`,
  );
  const license = firstComment?.tags.find((tag) => tag.tag === "license");
  const licenseText =
    `${license?.name || ""} ${license?.description || ""}`.trim();
  if (
    licenseText.match(
      /(?:^0BSD$)|(?:^BSD Zero Clause License$)|(?:public domain)/i,
    )
  ) {
    consola.debug(`Verified ${cInfo(licenseText)} in registry ${cInfo(path)}`);
  } else {
    consola.warn(
      `Ensure you are compliant with license ${cWarning(licenseText || "<unknown>")} in registry ${cInfo(path)}`,
    );
  }
  const result: FunctionEntry[] = [];
  for (const node of registrySource.program.body) {
    if (!isExportFunction(node)) {
      continue;
    }
    const docComment = node.comments?.find(
      (comment) => comment.type === "CommentBlock",
    );
    if (!docComment) {
      continue;
    }
    const funcName = node.declaration.id.name.toString();
    const [doc] = docParse(`/*${docComment.value}*/`);
    if (!doc) {
      consola.warn(
        `No doc comment for function ${cInfo(funcName)} in registry ${cInfo(
          path,
        )}`,
      );
      continue;
    }
    result.push({
      name: funcName,
      doc,
      content: node,
      function: node.declaration,
    });
  }
  return result;
}

export async function* loadRegistries(config: UdepsConfig) {
  consola.debug(`Supported libs: ${cInfo(config.lib.join(", "))}`);
  for (const registry of config.registry) {
    const registryObj = await loadRegistry(registry, config);
    yield [
      registry.split(/[\\/]/).at(-1)?.trim() || registry,
      registryObj,
    ] as const;
  }
}

export function getDocsUrl(functionName: string) {
  const parts = functionName.split(".").filter((x) => x !== "prototype");
  return `https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/${parts.join("/")}`;
}

export interface DeprecatedReason {
  inline?: string;
  since?: string;
  "replace-with"?: string;
}

export function formatDeprecatedReason(
  entry: FunctionEntry,
  reason: DeprecatedReason,
) {
  const { inline: shouldInline, "replace-with": replaceWith } = reason;
  if (replaceWith) {
    return `⚠️  Use the native function ${cStrong(replaceWith)}\n    ${cGray(getDocsUrl(replaceWith))}`;
  }
  if (shouldInline != null) {
    const inline = printInline(entry.function);
    if (inline) {
      if (shouldInline === "recommend") {
        return `⚠️  This should be inlined as ${cStrong(inline)}`;
      }
      return `❓ Consider inlining this as ${cStrong(inline)}`;
    }
  }
  return "";
}
