import { defineCommand } from "citty";
import consola, { LogLevels } from "consola";
import { add } from "./commands/add.ts";
import { remove } from "./commands/remove.ts";
import { search } from "./commands/search.ts";
import { loadConfig, setConfig } from "./config.ts";

function argArray(arg: string | undefined): string[] | null {
  return arg
    ? arg
        .split(/[,;\s]+/)
        .map((s) => s.trim())
        .filter(Boolean)
    : null;
}

export const cli = defineCommand({
  meta: {
    name: "udeps",
    description:
      "A micro-dependency manager for TypeScript and JavaScript projects",
  },
  args: {
    debug: {
      type: "boolean",
      description: "Enable debug logging",
    },
    project: {
      type: "string",
      description: "Path to the package directory",
    },
    config: {
      type: "string",
      description:
        "Path to the udeps configuration file, relative to package directory",
      default: "./udeps.json",
    },
    lib: {
      type: "string",
      description:
        "Comma-separated list of platform libraries in the same format as tsconfig.json, plus 'node' for Node.js built-ins and '[inherit]' to inherit from the project's tsconfig.json",
    },
    output: {
      type: "string",
      description:
        "Path to a .js or .ts file which stores installed dependencies, relative to package directory",
    },
    registry: {
      type: "string",
      description:
        "Comma-separated list of file paths or URLs to udeps registries",
    },
  },
  subCommands: { add, remove, search },
  async setup(ctx) {
    const { args } = ctx;
    if (args.debug) {
      consola.level = LogLevels.debug;
      consola.debug("Debug logging enabled");
    }
    const config = loadConfig(
      args.config,
      // Only override config entries where a value has been specified
      Object.fromEntries(
        Object.entries({
          project: args.project,
          outputFile: args.output,
          lib: argArray(args.lib),
          registry: argArray(args.registry),
        }).filter(([_, v]) => Boolean(v)),
      ),
    );
    for (const cmd of Object.values(this.subCommands || {})) {
      setConfig(cmd, config);
    }
  },
});
