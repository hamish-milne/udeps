import { defineCommand } from "citty";
import consola from "consola";
import { search as fuzzySearch } from "fast-fuzzy";
import { cGray, cInfo, cStrong, cSuccess, cWarning } from "../colors.ts";
import { getConfig } from "../config.ts";
import { getMissingLibsForEntry, isEntryObsolete } from "../libSupport.ts";
import {
  type DeprecatedReason,
  type FunctionEntry,
  formatDeprecatedReason,
  loadRegistries,
} from "../registry.ts";

const MAX_RESULTS = 5;

function entriesToList(entries: [FunctionEntry, DeprecatedReason | null][]) {
  return `${entries
    .slice(0, MAX_RESULTS)
    .map(
      ([entry, reason]) =>
        `- ${cStrong(entry.name)}: ${cGray(entry.doc.description.split(". ")[0])}${reason ? `\n${formatDeprecatedReason(entry, reason)}\n` : ""}`,
    )
    .join(
      "\n",
    )}${entries.length > MAX_RESULTS ? `\n...and ${entries.length - MAX_RESULTS} more results.` : ""}`;
}

export const search = defineCommand({
  meta: {
    name: "search",
    description: "Search the micro-dependency registry",
  },
  args: {
    query: {
      type: "positional",
      description: "Search query",
      required: true,
    },
  },
  async run({ args }) {
    const config = getConfig(this);
    const query = args._.join(" ");
    consola.info(`Searching for: ${cInfo(query)}`);
    const allEntries: FunctionEntry[] = [];
    for await (const [registry, entries] of loadRegistries(config)) {
      consola.debug(
        `Loaded ${cInfo(entries.length.toString())} entries from registry ${cInfo(registry)}`,
      );
      allEntries.push(...entries);
    }
    const candidates = new Map(
      allEntries.map(
        (entry) => [`${entry.name} ${entry.doc.description}`, entry] as const,
      ),
    );
    const matches = fuzzySearch(query, Array.from(candidates.keys()), {
      threshold: 0.5,
    })
      .map((name) => candidates.get(name))
      .filter<FunctionEntry>((x) => x != null);
    const unsupportedMatches: FunctionEntry[] = [];
    const supportedMatches: [FunctionEntry, DeprecatedReason | null][] = [];
    for (const match of matches) {
      if (getMissingLibsForEntry(config, match).length === 0) {
        supportedMatches.push([match, isEntryObsolete(match, config)]);
      } else {
        unsupportedMatches.push(match);
      }
    }
    if (unsupportedMatches.length > 0) {
      consola.info(
        `Found ${cWarning(unsupportedMatches.length)} unsupported matches`,
      );
    }
    if (supportedMatches.length > 0) {
      consola.success({
        message: `Found ${cSuccess(supportedMatches.length > MAX_RESULTS ? `lots of` : supportedMatches.length)} supported matches:`,
        additional: entriesToList(supportedMatches),
      });
    } else {
      consola.warn("No supported matches found in any registry.");
      return;
    }
  },
});
