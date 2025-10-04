import { spawn } from "child_process";
import { existsSync } from "fs";
import { join } from "path";

import Log from "../../utils/log";
import { detectProject } from "../utils/detect";

export default async function buildCommand() {
  try {
    const config = detectProject();

    if (!config.isTypeScript) {
      Log.info("javascript project - no build step needed");
      return;
    }

    Log.info("building typescript project...");

    // Check if tsconfig.json exists
    const tsconfigPath = join(process.cwd(), "tsconfig.json");
    if (!existsSync(tsconfigPath)) {
      Log.error("tsconfig.json not found");
      process.exit(1);
    }

    // Check for tsc in user's node_modules first, fallback to project's typescript
    const userTsc = join(process.cwd(), "node_modules", ".bin", "tsc");
    const command = userTsc;
    const args: string[] = [];

    Log.wait("compiling typescript...");

    const child = spawn(command, args, {
      stdio: "inherit",
    });

    child.on("error", (error) => {
      Log.error(`build failed: ${error.message}`);
      process.exit(1);
    });

    child.on("exit", (code) => {
      if (code !== 0) {
        Log.error(`build failed with code ${code}`);
        process.exit(code || 1);
      } else {
        Log.ready("build completed successfully");
      }
    });
  } catch (error) {
    Log.error(
      error instanceof Error ? error.message : "unknown error occurred",
    );
    process.exit(1);
  }
}
