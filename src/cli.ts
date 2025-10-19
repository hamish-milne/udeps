import { runMain } from "citty";
import consola, { LogLevels } from "consola";
import { add } from "./commands/add.ts";
import { remove } from "./commands/remove.ts";
import { search } from "./commands/search.ts";

runMain({
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
  },
  subCommands: { add, remove, search },
  async setup({ args }) {
    if (args.debug) {
      consola.level = LogLevels.debug;
      consola.debug("Debug logging enabled");
    }
  },
});
