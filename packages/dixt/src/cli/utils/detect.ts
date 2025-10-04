import { existsSync } from "fs";
import { join } from "path";

export interface ProjectConfig {
  isTypeScript: boolean;
  entryPoint: string;
  srcDir: string;
}

export function detectProject(cwd: string = process.cwd()): ProjectConfig {
  const hasSrcDir = existsSync(join(cwd, "src"));
  const srcDir = hasSrcDir ? "src" : ".";

  // Check for TypeScript entry point
  const tsEntry = join(cwd, srcDir, "index.ts");
  const jsEntry = join(cwd, srcDir, "index.js");

  if (existsSync(tsEntry)) {
    return {
      isTypeScript: true,
      entryPoint: join(srcDir, "index.ts"),
      srcDir,
    };
  }

  if (existsSync(jsEntry)) {
    return {
      isTypeScript: false,
      entryPoint: join(srcDir, "index.js"),
      srcDir,
    };
  }

  throw new Error(
    `Could not find entry point. Expected ${tsEntry} or ${jsEntry}`,
  );
}
