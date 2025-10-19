import { runMain } from "citty";
import { add } from "./commands/add.ts";
import { remove } from "./commands/remove.ts";
import { search } from "./commands/search.ts";

runMain({
  meta: {
    name: "udeps",
    description:
      "A micro-dependency manager for TypeScript and JavaScript projects",
  },
  subCommands: { add, remove, search },
});
