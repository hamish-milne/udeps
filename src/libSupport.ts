import type { UdepsConfig } from "./config.ts";
import type { DeprecatedReason, FunctionEntry } from "./registry.ts";

function getEsVersionIndex(esVersion: string) {
  if (esVersion.toLowerCase() === "esnext") {
    return Infinity;
  }
  const numberPart = esVersion.match(/^es(\d+)/i);
  if (numberPart) {
    const year = parseInt(numberPart[1], 10);
    if (year <= 6) {
      return year;
    }
    if (year >= 2015 && year <= 2099) {
      return year - 2015 + 6;
    }
  }
  return null;
}

function checkMissingLibs(
  targetLib: string[],
  requiredLib: string[],
): string[] {
  const targetEsVersion = Math.max(
    ...targetLib
      .filter((x) => !x.includes("."))
      .map((x) => getEsVersionIndex(x) ?? 0),
  );
  const targetSet = targetLib.map((l) => l.toLowerCase());
  return requiredLib.filter(
    (lib) =>
      (getEsVersionIndex(lib) ?? Infinity) > targetEsVersion &&
      !targetSet.includes(lib.toLowerCase()),
  );
}

export function getMissingLibsForEntry(
  config: UdepsConfig,
  entry: FunctionEntry,
) {
  const requiredLibs = entry.doc.tags
    .filter((tag) => tag.tag === "requires")
    .map((tag) => tag.name);
  return checkMissingLibs(config.lib, requiredLibs);
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
  if (reason.since && checkMissingLibs(config.lib, [reason.since]).length > 0) {
    return reason.inline ? { inline: reason.inline } : null;
  }
  return reason;
}

function unwrapLink(str: string): string {
  const match = str.match(/\{@link\s+([^}]+)\}/);
  return match ? match[1] : str;
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
