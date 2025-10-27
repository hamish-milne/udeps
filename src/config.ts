import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import consola from "consola";
import json5 from "json5";
import { packageDirectorySync } from "package-directory";
import { cInfo } from "./colors.ts";

export interface UdepsConfig {
  project: string;
  outputFile: string;
  lib: string[];
  registry: string[];
}

interface TSConfig {
  compilerOptions?: {
    lib?: string[];
  };
}

const LIB_INHERIT = "[inherit]";

const defaultConfig: UdepsConfig = {
  project: ".",
  outputFile: "udeps.ts",
  lib: [LIB_INHERIT],
  registry: [
    `https://raw.githubusercontent.com/hamish-milne/udeps/refs/heads/master/registry/main.ts`,
    `https://raw.githubusercontent.com/hamish-milne/udeps/refs/heads/master/registry/compat.ts`,
  ],
};

export function loadConfig(
  path: string,
  args: Partial<UdepsConfig>,
): UdepsConfig {
  const packageDir = args.project || packageDirectorySync() || process.cwd();
  consola.debug(`Using package directory: ${cInfo(packageDir)}`);
  const configPath = resolve(packageDir, path);
  const tsconfigPath = resolve(packageDir, "tsconfig.json");
  consola.debug(`Attempt to load configuration from ${cInfo(configPath)}`);
  const userConfig = existsSync(configPath)
    ? (JSON.parse(readFileSync(configPath, "utf-8")) as Partial<UdepsConfig>)
    : {};
  consola.debug(`Attempt to load tsconfig from ${cInfo(tsconfigPath)}`);
  const { compilerOptions: { lib: tsconfigLib } = { lib: undefined } } =
    existsSync(tsconfigPath)
      ? (json5.parse(readFileSync(tsconfigPath, "utf-8")) as TSConfig)
      : {};
  const config = Object.assign(
    defaultConfig,
    { project: packageDir },
    userConfig,
    args,
  );
  consola.debug({
    message: `Intermediate configuration:`,
    additional: JSON.stringify(config, null, 2),
  });
  const resolvedConfig: UdepsConfig = {
    project: resolve(config.project),
    outputFile: resolve(packageDir, config.outputFile),
    lib: Array.from(
      new Set(
        config.lib.flatMap((lib) =>
          lib === LIB_INHERIT ? (tsconfigLib ?? []) : [lib],
        ),
      ),
    ),
    registry: config.registry,
  };
  if (resolvedConfig.lib.length === 0) {
    consola.warn(
      `No libraries specified in udeps config or tsconfig.json; defaulting to "dom" and "esnext"`,
    );
    resolvedConfig.lib.push("dom", "esnext");
  }
  consola.debug({
    message: `Resolved configuration:`,
    additional: JSON.stringify(resolvedConfig, null, 2),
  });
  return resolvedConfig;
}

// NOTE: The below is needed to share the config to sub-commands
const configKey = Symbol.for("udeps.config");

export function setConfig(obj: object, config: UdepsConfig) {
  Reflect.set(obj, configKey, config);
}

export function getConfig(obj: object): UdepsConfig {
  const config = Reflect.get(obj, configKey) as UdepsConfig | undefined;
  if (!config) {
    throw new Error("Udeps configuration has not been set");
  }
  return config;
}
