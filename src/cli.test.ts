import { normalize } from "node:path";
import { runCommand } from "citty";
import { expect, onTestFinished, test, vi } from "vitest";

const exampleTsFunction = `
/**
 * Example function
 */
export function oldFunction(): void {
  console.log("This is the old function.");
}
`;

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
  onTestFinished(() => {
    vi.unstubAllGlobals();
    vi.doUnmock("node:fs");
    vi.doUnmock("node:path");
    vi.resetModules();
  });
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

test("add function to JS file", async () => {
  const files = {
    "udeps.json": JSON.stringify({
      lib: ["es2020"],
      outputFile: "./udeps-lib.js",
      registry: [mockRegistryPath],
    }),
    "udeps-lib.js": "",
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
    "udeps-lib.js": expect.stringContaining(
      exampleTsFunction.replace(/: void/, "").trim(),
    ),
  });
});

test("function not found", async () => {
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
    rawArgs: ["--debug", "--project=.", "add", "nonExistentFunction"],
  });
  expect(files).toMatchObject({
    "udeps-lib.ts": "",
  });
  await runCommand(cli, {
    rawArgs: ["--debug", "--project=.", "remove", "oldFunction"],
  });
  expect(files).toMatchObject({
    "udeps-lib.ts": "",
  });
});

test("no udeps.json", async () => {
  const files = {};
  const urls = {
    [mockRegistryPath]: mockRegistryContents,
  };
  setupMocks(files, urls);
  const { cli } = await import("./cli.js");
  await runCommand(cli, {
    rawArgs: [
      "--debug",
      "--project=.",
      `--registry=${mockRegistryPath}`,
      "add",
      "oldFunction",
    ],
  });
  expect(files).toMatchObject({
    "udeps.ts": expect.stringContaining(exampleTsFunction.trim()),
  });
});

test("search function", async () => {
  const files = {};
  const urls = {
    [mockRegistryPath]: mockRegistryContents,
  };
  setupMocks(files, urls);
  const { cli } = await import("./cli.js");
  const stdoutSpy = vi.spyOn(process.stdout, "write");
  await runCommand(cli, {
    rawArgs: [
      "--debug",
      "--project=.",
      `--registry=${mockRegistryPath}`,
      "search",
      "oldFunction",
    ],
  });
  expect(stdoutSpy).toHaveBeenCalledWith(
    expect.stringMatching(/\[success\].+?oldFunction/s),
  );
});
