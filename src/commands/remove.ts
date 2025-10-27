import { defineCommand } from "citty";
import { getConfig } from "../config.ts";
import { removeFromFile } from "../outputFile.ts";

export const remove = defineCommand({
  meta: {
    name: "remove",
    description: "Remove a micro-dependency from your project's udeps library",
  },
  args: {
    name: {
      type: "positional",
      description: "Name of the micro-dependency to remove",
      required: true,
    },
  },
  async run({ args: { _: toRemove } }) {
    const config = getConfig(this);
    removeFromFile(config.outputFile, toRemove);
  },
});
