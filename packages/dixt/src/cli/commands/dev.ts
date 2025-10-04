import { spawn } from "child_process";
import chokidar from "chokidar";
import { join } from "path";

import Log from "../../utils/log";
import { detectProject } from "../utils/detect";

export default async function devCommand() {
  try {
    const config = detectProject();

    Log.info("starting development server...");
    Log.info(
      `detected ${config.isTypeScript ? "TypeScript" : "JavaScript"} project`,
    );

    let child: ReturnType<typeof spawn> | null = null;
    let isRestarting = false;

    const startProcess = () => {
      if (isRestarting) return;

      if (child) {
        isRestarting = true;
        child.kill();
        return;
      }

      // Find tsx from the user's project node_modules
      const tsxLoader = join(
        process.cwd(),
        "node_modules",
        "tsx",
        "dist",
        "loader.mjs",
      );

      const args = config.isTypeScript
        ? ["--import", tsxLoader, config.entryPoint] // Use tsx loader for TypeScript
        : [config.entryPoint];

      child = spawn("node", args, {
        stdio: "inherit",
        cwd: process.cwd(),
      });

      child.on("exit", (code) => {
        child = null;

        if (isRestarting) {
          isRestarting = false;
          // Restart the process
          setTimeout(startProcess, 100);
        } else if (code !== 0 && code !== null) {
          Log.error(`process exited with code ${code}`);
        }
      });

      child.on("error", (error) => {
        Log.error(`failed to start: ${error.message}`);
      });
    };

    // Start initial process
    startProcess();

    // Watch for file changes
    const watcher = chokidar.watch(config.srcDir, {
      ignored: /(^|[/\\])\../, // Ignore dotfiles
      persistent: true,
      ignoreInitial: true,
    });

    watcher.on("change", (path) => {
      Log.info(`file changed: ${path}`);
      Log.info("restarting...");
      startProcess();
    });

    // Handle graceful shutdown
    const shutdown = () => {
      watcher.close();
      if (child) {
        child.kill();
      }
      process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    Log.error(
      error instanceof Error ? error.message : "unknown error occurred",
    );
    process.exit(1);
  }
}
