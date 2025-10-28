import { normalize } from "node:path";
import { runCommand } from "citty";
import { expect, test, vi } from "vitest";

const exampleTsFunction = `
/**
 * Example function
 */
export function oldFunction(): void {
  console.log("This is the old function.");
}
`;
const exampleJsFunction = exampleTsFunction.replace(/: void/, "");

const mockRegistryPath = "https://example.com/udeps/registry.json";
const mockRegistryContents = `
/**
 * @module example/registry
 * @license 0BSD
 */

/**
 * Example function
 * @deprecated since=ES2015, replaceWith=example.newFunction
 */
export function oldFunction(): void {
  console.log("This is the old function.");
}
`;

function setupMocks(
  files: Record<string, string>,
  urls: Record<string, string>,
) {
  vi.stubGlobal("fetch", async (url: string) => {
    if (url in urls) {
      return new Response(urls[url]);
    }
    throw new Error(`Unexpected fetch URL: ${url}`);
  });
  vi.doMock("node:fs", () => ({
    readFileSync(path: string) {
      if (path in files) {
        return files[path];
      }
      throw new Error(`Unexpected readFileSync path: ${path}`);
    },
    existsSync(path: string) {
      return path in files;
    },
    writeFileSync(path: string, data: string) {
      files[path] = data;
    },
  }));
  vi.doMock("node:path", () => ({
    resolve(...paths: string[]) {
      return normalize(paths.join("/"));
    },
  }));
}

test("add/remove function", async () => {
  const files = {
    "udeps.json": JSON.stringify({
      lib: ["es2020"],
      outputFile: "./udeps-lib.ts",
      registry: [mockRegistryPath],
    }),
    "udeps-lib.ts": "",
  };
  const urls = {
    [mockRegistryPath]: mockRegistryContents,
  };
  setupMocks(files, urls);
  const { cli } = await import("./cli.js");
  await runCommand(cli, {
    rawArgs: ["--debug", "--project=.", "add", "oldFunction"],
  });
  expect(files).toMatchObject({
    "udeps-lib.ts": expect.stringContaining(exampleTsFunction.trim()),
  });
  // Second time should be no-op
  await runCommand(cli, {
    rawArgs: ["--debug", "--project=.", "add", "oldFunction"],
  });
  expect(files).toMatchObject({
    "udeps-lib.ts": expect.stringContaining(exampleTsFunction.trim()),
  });
  await runCommand(cli, {
    rawArgs: ["--debug", "--project=.", "remove", "oldFunction"],
  });
  expect(files).toMatchObject({
    "udeps-lib.ts": expect.stringMatching(/^\s+$/),
  });
});
