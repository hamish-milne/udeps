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

function getEsVersionIndex(esVersion: string) {
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

const defaultConfig: UdepsConfig = {
  project: ".",
  outputFile: "udeps.ts",
  lib: ["es2020"],
  registry: [
    `https://raw.githubusercontent.com/hamish-milne/udeps/refs/heads/master/registry/main.ts`,
    `https://raw.githubusercontent.com/hamish-milne/udeps/refs/heads/master/registry/compat.ts`,
  ],
};

export function loadConfig(): UdepsConfig {
  const packageDir = packageDirectorySync() || process.cwd();
  consola.debug(`Using package directory: ${cInfo(packageDir)}`);
  const configPath = resolve(packageDir, "udeps.json");
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
    tsconfigLib ? { lib: tsconfigLib } : {},
    userConfig,
  );
  config.project = resolve(packageDir);
  config.outputFile = resolve(config.project, config.outputFile);
  consola.debug({
    message: `Final configuration:`,
    additional: JSON.stringify(config, null, 2),
  });
  return config;
}

export function checkLibSupport(
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
