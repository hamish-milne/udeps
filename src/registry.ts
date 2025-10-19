import { readFile } from "node:fs/promises";
import type { namedTypes } from "ast-types";
import { type Block, parse as docParse } from "comment-parser";
import consola from "consola";
import { parse as jsParse, print } from "recast";
import * as typescriptParser from "recast/parsers/typescript.js";
import { cGray, cInfo, cStrong } from "./colors.ts";
import { checkLibSupport, type UdepsConfig } from "./config.ts";

export interface FunctionEntry {
  name: string;
  doc: Block;
  content: namedTypes.ExportNamedDeclaration;
  function: namedTypes.FunctionDeclaration;
}

async function loadRegistry(path: string) {
  const registrySource: namedTypes.File = jsParse(
    await readFile(path, "utf-8"),
    {
      parser: typescriptParser,
    },
  );
  const result: FunctionEntry[] = [];
  for (const node of registrySource.program.body) {
    if (
      node.type !== "ExportNamedDeclaration" ||
      node.declaration?.type !== "FunctionDeclaration" ||
      !node.declaration.id?.name
    ) {
      continue;
    }
    const docComment = node.comments?.find(
      (comment) => comment.type === "CommentBlock",
    );
    if (!docComment) {
      continue;
    }
    const funcName = node.declaration.id.name;
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
  consola.verbose(`Supported libs: ${cInfo(config.lib.join(", "))}`);
  for (const registry of config.registry) {
    consola.verbose(`Using registry: ${cInfo(registry)}`);
    const registryObj = await loadRegistry(registry);
    yield [registry, registryObj] as const;
  }
}

export function getDocsUrl(functionName: string) {
  const parts = functionName.split(".").filter((x) => x !== "prototype");
  return `https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/${parts.join("/")}`;
}

function unwrapLink(str: string): string {
  const match = str.match(/\{@link\s+([^}]+)\}/);
  return match ? match[1] : str;
}

export interface DeprecatedReason {
  inline?: string;
  since?: string;
  "replace-with"?: string;
}

function parseTagProperties<T extends string>(str: string) {
  const props: Partial<Record<T, string>> = {};
  const parts = str.split(/\s*,\s*/);
  for (const part of parts) {
    const [key, ...rest] = part.split("=");
    const value = rest.join("=").trim();
    props[key as T] = value ? unwrapLink(value) : "";
  }
  return props;
}

export function isEntrySupported(config: UdepsConfig, entry: FunctionEntry) {
  const requiredLibs = entry.doc.tags
    .filter((tag) => tag.tag === "requires")
    .map((tag) => tag.name);
  return checkLibSupport(config.lib, requiredLibs);
}

export function isEntryObsolete(
  entry: FunctionEntry,
  config: UdepsConfig,
): DeprecatedReason | null {
  const deprecatedTag = entry.doc.tags.find((tag) => tag.tag === "deprecated");
  if (!deprecatedTag || !deprecatedTag.name) {
    return null;
  }
  const reason = parseTagProperties<keyof DeprecatedReason>(deprecatedTag.name);
  if (reason.since && checkLibSupport(config.lib, [reason.since]).length > 0) {
    return { inline: reason.inline };
  }
  return reason;
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
    const inline = printInline(entry);
    if (inline) {
      if (shouldInline === "recommend") {
        return `⚠️  This should be inlined as ${cStrong(inline)}`;
      }
      return `❓ Consider inlining this as ${cStrong(inline)}`;
    }
  }
  return "";
}

export function printInline(entry: FunctionEntry) {
  const body = entry.function.body.body;
  if (
    body.length === 1 &&
    body[0].type === "ReturnStatement" &&
    body[0].argument
  ) {
    return print(body[0].argument).code;
  }
  return null;
}
