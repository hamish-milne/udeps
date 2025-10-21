import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { type ASTNode, type namedTypes, visit } from "ast-types";
import { type Block, parse as docParse } from "comment-parser";
import consola from "consola";
import { parse as jsParse, print } from "recast";
import * as typescriptParser from "recast/parsers/typescript.js";
import { cGray, cInfo, cStrong, cWarning } from "./colors.ts";
import { checkLibSupport, type UdepsConfig } from "./config.ts";

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
  const registrySource: namedTypes.File = jsParse(
    await loadFileOrUrl(path, config),
    {
      parser: typescriptParser,
    },
  );
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
  if (!deprecatedTag) {
    return null;
  }
  const text = `${deprecatedTag.name} ${deprecatedTag.description}`.trim();
  const reason = parseTagProperties<keyof DeprecatedReason>(text);
  if (reason.since && checkLibSupport(config.lib, [reason.since]).length > 0) {
    return reason.inline ? { inline: reason.inline } : null;
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
    return print(stripTypes(body[0].argument)).code;
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
