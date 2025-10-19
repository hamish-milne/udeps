import { defineCommand } from "citty";
import consola from "consola";
import { cError, cInfo, cSuccess, cWarning } from "../colors.ts";
import { loadConfig } from "../config.ts";
import { insertIntoFile } from "../outputFile.ts";
import {
  formatDeprecatedReason,
  isEntryObsolete,
  isEntrySupported,
  loadRegistries,
} from "../registry.ts";

export const add = defineCommand({
  meta: {
    name: "add",
    description: "Add a micro-dependency to your project's udeps library",
  },
  args: {
    name: {
      type: "positional",
      description: "Name of the micro-dependency to add",
      required: true,
    },
  },
  async run({ args: { _: toAdd } }) {
    for (const name of toAdd) {
      consola.info(`Adding micro-dependency: ${cInfo(name)}`);
      const config = loadConfig();
      let found = false;
      for await (const [registry, entries] of loadRegistries(config)) {
        const candidate = entries.find((entry) => entry.name === name);
        if (!candidate) {
          consola.verbose(`No implementation found in registry ${cInfo(name)}`);
          continue;
        }
        const unsupportedLibs = isEntrySupported(config, candidate);
        if (unsupportedLibs.length > 0) {
          consola.info(
            `The implementation in registry ${cInfo(registry)} requires unsupported libs: ${cWarning(
              unsupportedLibs.join(", "),
            )}`,
          );
          continue;
        }
        found = true;
        const reason = isEntryObsolete(candidate, config);
        consola.success({
          message: `Supported implementation of ${cSuccess(name)} found in registry ${cInfo(registry)}`,
          additional: reason
            ? formatDeprecatedReason(candidate, reason)
            : undefined,
        });
        const confirm =
          !reason ||
          (await consola.prompt(
            `This implementation is obsolete. Are you sure you want to add it?`,
            { type: "confirm", initial: false },
          ));
        if (confirm) {
          insertIntoFile(config.outputFile, candidate);
        }
        break;
      }
      if (!found) {
        consola.error(
          `No supported implementation of ${cError(name)} was found.`,
        );
      }
    }
  },
});
