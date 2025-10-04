#!/usr/bin/env node

import { Command } from "commander";
import { readFileSync } from "fs";
import { join } from "path";

import buildCommand from "./commands/build";
import devCommand from "./commands/dev";
import startCommand from "./commands/start";

// Read version from package.json
const packageJson = JSON.parse(
  readFileSync(join(__dirname, "..", "..", "package.json"), "utf-8"),
);

const program = new Command();

program
  .name(packageJson.name)
  .description(packageJson.description)
  .version(packageJson.version);

program
  .command("dev")
  .description("Start the bot in development mode")
  .action(devCommand);

program
  .command("build")
  .description("Build the bot for production")
  .action(buildCommand);

program
  .command("start")
  .description("Start the bot in production mode")
  .action(startCommand);

program.parse();
