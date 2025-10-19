import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import consola from "consola";
import { packageDirectorySync } from "package-directory";
import { cError } from "./colors.ts";

export interface UdepsConfig {
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
  consola.error(`Invalid ES version: ${cError(esVersion)}`);
  return -1;
}

const defaultConfig: UdepsConfig = {
  outputFile: "udeps.ts",
  lib: ["es2020"],
  registry: [],
};

export function loadConfig(): UdepsConfig {
  consola.verbose("Loading configuration...");
  const packageDir = packageDirectorySync() || process.cwd();
  const configPath = join(packageDir, "udeps.json");
  const tsconfigPath = join(packageDir, "tsconfig.json");
  const userConfig = existsSync(configPath)
    ? (JSON.parse(readFileSync(configPath, "utf-8")) as Partial<UdepsConfig>)
    : {};
  const { compilerOptions: { lib: tsconfigLib } = { lib: undefined } } =
    existsSync(tsconfigPath)
      ? (JSON.parse(readFileSync(tsconfigPath, "utf-8")) as TSConfig)
      : {};
  return Object.assign(
    {},
    defaultConfig,
    tsconfigLib ? { lib: tsconfigLib } : {},
    userConfig,
  );
}

export function checkLibSupport(
  targetLib: string[],
  requiredLib: string[],
): string[] {
  const targetEsVersion = Math.max(
    ...targetLib.filter((x) => !x.includes(".")).map(getEsVersionIndex),
  );
  const targetSet = targetLib.map((l) => l.toLowerCase());
  return requiredLib.filter(
    (lib) =>
      getEsVersionIndex(lib) > targetEsVersion &&
      !targetSet.includes(lib.toLowerCase()),
  );
}
