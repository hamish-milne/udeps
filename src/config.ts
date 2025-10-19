import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import consola from "consola";
import { packageDirectorySync } from "package-directory";

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

const esVersions = [
  "es5",
  "es2015",
  "es2016",
  "es2017",
  "es2018",
  "es2019",
  "es2020",
  "es2021",
  "es2022",
  "es2023",
  "es2024",
  "es2025",
];

const defaultConfig: UdepsConfig = {
  outputFile: "udeps.ts",
  lib: ["es2020"],
  registry: ["./src/udeps.ts", "./src/udeps-legacy.ts"],
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
  const targetSet = new Set<string>();
  for (const lib of targetLib.map((l) => l.toLowerCase())) {
    const [esVersion, ...parts] = lib.split(".");
    if (parts.length === 0) {
      const esVerIdx = esVersions.indexOf(esVersion);
      if (esVerIdx < 0) {
        throw new Error(`Target lib "${esVersion}" is not a known ES version.`);
      }
      for (let i = 0; i <= esVerIdx; i++) {
        targetSet.add(esVersions[i]);
      }
    } else {
      targetSet.add(lib);
    }
  }
  const unsupportedLibs: string[] = [];
  for (const reqLib of requiredLib.map((l) => l.toLowerCase())) {
    if (targetSet.has(reqLib)) {
      continue;
    }
    const [esVersion, ...parts] = reqLib.split(".");
    if (parts.length > 0 && targetSet.has(esVersion)) {
      continue;
    }
    unsupportedLibs.push(reqLib);
  }
  return unsupportedLibs;
}
