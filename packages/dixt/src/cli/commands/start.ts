import { spawn } from "child_process";
import { existsSync } from "fs";
import { join } from "path";

import Log from "../../utils/log";
import { detectProject } from "../utils/detect";

export default async function startCommand() {
  try {
    const config = detectProject();

    Log.info("starting production server...");

    let command: string;
    let args: string[];

    if (config.isTypeScript) {
      // For TypeScript, run the compiled dist/index.js
      const distEntry = join(process.cwd(), "dist", "index.js");
      if (!existsSync(distEntry)) {
        Log.error("compiled output not found. run 'dixt build' first.");
        process.exit(1);
      }

      command = "node";
      args = [distEntry];
    } else {
      // For JavaScript, run the entry point directly
      command = "node";
      args = [config.entryPoint];
    }

    Log.ready(`running: ${command} ${args.join(" ")}`);

    const child = spawn(command, args, {
      stdio: "inherit",
      shell: true,
    });

    child.on("error", (error) => {
      Log.error(`failed to start: ${error.message}`);
      process.exit(1);
    });

    child.on("exit", (code) => {
      // Code 130 = SIGINT (Ctrl+C), which is a normal exit
      if (code !== 0 && code !== 130) {
        Log.error(`process exited with code ${code}`);
        process.exit(code || 1);
      }
    });

    // Handle graceful shutdown
    let isShuttingDown = false;

    const shutdown = (signal: NodeJS.Signals) => {
      if (isShuttingDown) return;
      isShuttingDown = true;

      child.kill(signal);

      // Wait for child to exit, or force kill after timeout
      const timeout = setTimeout(() => {
        child.kill("SIGKILL");
        process.exit(0);
      }, 3000);

      child.on("exit", () => {
        clearTimeout(timeout);
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    Log.error(
      error instanceof Error ? error.message : "unknown error occurred",
    );
    process.exit(1);
  }
}
