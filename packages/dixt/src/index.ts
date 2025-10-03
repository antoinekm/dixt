import { exec } from "child_process";
import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
  type Options,
} from "discord.js";
import dotenv from "dotenv-flow";
import EventEmiter from "events";
import fs from "fs";
import { merge } from "lodash";
import mongoose, { type Mongoose } from "mongoose";
import path from "path";
import process from "process";
import { promisify } from "util";

import { createHelpCommand } from "./commands/help";
import type { DixtClient, DixtSlashCommandBuilder } from "./types";
import Log from "./utils/log";

dotenv.config({
  silent: true,
});

export type ClientOptions = Options;

export type DixtPluginReturn = {
  name: string;
  commands?: DixtSlashCommandBuilder[];
};

export type DixtPlugin<DixtPluginOptions = object> = (
  _dixt: dixt,
  _options?: DixtPluginOptions,
) => DixtPluginReturn | Promise<DixtPluginReturn>;

export type DixtOptions = {
  clientOptions?: ClientOptions;
  application?: {
    id?: string;
    name?: string;
    logo?: string;
    bot?: {
      token?: string;
    };
  };
  plugins?: (DixtPlugin | [DixtPlugin, object])[];
  autoDiscoverPlugins?: boolean;
  pluginOptionsPath?: string;
  databaseUri?: string;
  messages?: {
    error?: {
      dmBlocked?: string;
    };
  };
};

export const dixtDefaults = {
  clientOptions: {
    intents: Object.values(GatewayIntentBits) as GatewayIntentBits[],
  },
  application: {
    id: process.env.DIXT_APPLICATION_ID || "",
    name: process.env.DIXT_APPLICATION_NAME || "",
    logo: process.env.DIXT_APPLICATION_LOGO || "",
    bot: {
      token: process.env.DIXT_BOT_TOKEN || "",
    },
  },
  plugins: [],
  autoDiscoverPlugins: true,
  pluginOptionsPath: "options",
  databaseUri: process.env.DIXT_DATABASE_URI || "",
  messages: {
    error: {
      // eslint-disable-next-line quotes
      dmBlocked: `it seems that your private messages are disabled. Please enable them in order to use this feature. To solve this problem, go to **Settings > Privacy & Security**, then check the box "Allow private messages from server members".\n\nIf the problem persists, please contact an administrator.`,
    },
  },
};

class dixt {
  public client: DixtClient;
  public application: DixtOptions["application"];
  public plugins: DixtOptions["plugins"];
  public autoDiscoverPlugins: DixtOptions["autoDiscoverPlugins"];
  public pluginOptionsPath: DixtOptions["pluginOptionsPath"];
  public databaseUri: DixtOptions["databaseUri"];
  public messages: DixtOptions["messages"];

  public static database: Mongoose = mongoose;
  public static events = new EventEmiter();

  private isExecError(
    error: unknown,
  ): error is { code: number; stdout: string } {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      "stdout" in error &&
      typeof (error as Record<string, unknown>).stdout === "string"
    );
  }

  private parseOutdatedPlugins(stdout: string) {
    try {
      const outdated = JSON.parse(stdout);
      return Object.keys(outdated)
        .filter((pkg) => pkg.startsWith("dixt-plugin-"))
        .map((plugin) => ({
          name: plugin,
          current: outdated[plugin].current,
          wanted: outdated[plugin].wanted,
        }));
    } catch {
      return [];
    }
  }

  private async discoverPlugins(): Promise<
    (DixtPlugin | [DixtPlugin, object])[]
  > {
    const discoveredPlugins: (DixtPlugin | [DixtPlugin, object])[] = [];

    try {
      const packageJsonPath = path.join(process.cwd(), "package.json");

      if (!fs.existsSync(packageJsonPath)) {
        Log.warn("package.json not found, skipping plugin discovery");
        return discoveredPlugins;
      }

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      const pluginNames = Object.keys(dependencies).filter((name) =>
        name.startsWith("dixt-plugin-"),
      );

      Log.info(`discovered ${pluginNames.length} plugins:`);

      for (const pluginName of pluginNames) {
        try {
          let pluginModule;
          try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            pluginModule = require(pluginName);
          } catch {
            // Try resolving from workspace packages
            const workspacePluginPath = path.resolve(
              process.cwd(),
              "..",
              "packages",
              pluginName,
              "dist",
              "index.js",
            );
            if (fs.existsSync(workspacePluginPath)) {
              // eslint-disable-next-line @typescript-eslint/no-var-requires
              pluginModule = require(workspacePluginPath);
            } else {
              throw new Error(`Cannot find module '${pluginName}'`);
            }
          }
          const plugin = pluginModule.default || pluginModule;

          let optionsPath = path.join(
            process.cwd(),
            this.pluginOptionsPath!,
            pluginName.replace("dixt-plugin-", ""),
          );

          // Fallback to src/options if options doesn't exist
          if (
            !fs.existsSync(`${optionsPath}.ts`) &&
            !fs.existsSync(`${optionsPath}.js`) &&
            this.pluginOptionsPath === "options"
          ) {
            optionsPath = path.join(
              process.cwd(),
              "src",
              "options",
              pluginName.replace("dixt-plugin-", ""),
            );
          }

          if (
            fs.existsSync(`${optionsPath}.ts`) ||
            fs.existsSync(`${optionsPath}.js`)
          ) {
            try {
              // eslint-disable-next-line @typescript-eslint/no-var-requires
              const optionsModule = require(optionsPath);
              const options = optionsModule.default || optionsModule;
              discoveredPlugins.push([plugin, options]);
              Log.info(`discovered plugin ${pluginName} with options`);
            } catch {
              discoveredPlugins.push(plugin);
              Log.info(`discovered plugin ${pluginName} without options`);
            }
          } else {
            discoveredPlugins.push(plugin);
            Log.info(`discovered plugin ${pluginName} without options`);
          }
        } catch (error) {
          Log.warn(`failed to load plugin ${pluginName}: ${error}`);
        }
      }
    } catch (error) {
      Log.error("failed to discover plugins:", error);
    }

    return discoveredPlugins;
  }

  private async checkPluginVersions() {
    const execAsync = promisify(exec);

    try {
      Log.wait("checking plugin versions");
      const { stdout } = await execAsync("npm outdated --json", {
        cwd: process.cwd(),
      });

      if (stdout?.trim()) {
        const outdatedPlugins = this.parseOutdatedPlugins(stdout);

        if (outdatedPlugins.length > 0) {
          Log.warn("outdated plugins detected:");
          outdatedPlugins.forEach(({ name, current, wanted }) => {
            Log.warn(`  ${name}: ${current} → ${wanted}`);
          });
          Log.warn("consider running: npm update");
        } else {
          Log.info("all plugins are up to date");
        }
      } else {
        Log.info("all plugins are up to date");
      }
    } catch (error) {
      if (this.isExecError(error) && error.code === 1 && error.stdout) {
        const outdatedPlugins = this.parseOutdatedPlugins(error.stdout);

        if (outdatedPlugins.length > 0) {
          Log.warn("outdated plugins detected:");
          outdatedPlugins.forEach(({ name, current, wanted }) => {
            Log.warn(`  ${name}: ${current} → ${wanted}`);
          });
          Log.warn("consider running: npm update");
        } else {
          Log.info("all plugins are up to date");
        }
      } else {
        Log.info("all plugins are up to date");
      }
    }
  }

  constructor(public options: DixtOptions = dixtDefaults) {
    this.client = new Client(
      merge({}, dixtDefaults.clientOptions, options.clientOptions),
    );
    this.application = merge({}, dixtDefaults.application, options.application);
    this.plugins = options.plugins || [];
    this.autoDiscoverPlugins =
      options.autoDiscoverPlugins ?? dixtDefaults.autoDiscoverPlugins;
    this.pluginOptionsPath =
      options.pluginOptionsPath || dixtDefaults.pluginOptionsPath;
    this.databaseUri = options.databaseUri || dixtDefaults.databaseUri;
    this.messages = merge({}, dixtDefaults.messages, options.messages);
  }

  public async start() {
    Log.wait("loading env files");
    dotenv
      .listFiles({
        node_env: process.env.NODE_ENV,
      })
      .forEach((file: string) => Log.info(`loaded env from ${file}`));

    await this.checkPluginVersions();

    if (!this.application?.id || !this.application?.bot?.token) {
      Log.error("missing discord application id or bot token");
      process.exit(1);
    }

    if (this.databaseUri) {
      Log.wait("connecting to database");
      try {
        await dixt.database.connect(this.databaseUri, {});
        Log.ready("connected to database");
      } catch (error) {
        Log.error("failed to connect to database");
        Log.error(error);
        process.exit(1);
      }
    }

    let pluginsToLoad = this.plugins || [];

    if (this.autoDiscoverPlugins) {
      Log.wait("discovering plugins");
      const discoveredPlugins = await this.discoverPlugins();
      pluginsToLoad = [...pluginsToLoad, ...discoveredPlugins];
    }

    const allCommands: DixtSlashCommandBuilder[] = [];
    this.client.commands = new Collection();

    if (pluginsToLoad.length === 0) {
      Log.info("skipping plugin loading, no plugins found");
    } else {
      Log.wait("loading plugins");
      for (const plugin of pluginsToLoad) {
        let result;
        if (Array.isArray(plugin)) {
          const [pluginModule, pluginOptions] = plugin;
          result = await pluginModule(this, pluginOptions);
        } else {
          result = await plugin(this);
        }

        const { name: pluginName, commands } = result;
        Log.info(`loaded plugin ${pluginName}`);

        if (commands && commands.length > 0) {
          commands.forEach((command) => {
            allCommands.push(command);
            this.client.commands!.set(command.data.name, command);
          });
          Log.info(
            `registered ${commands.length} command(s) from ${pluginName}`,
          );
        }
      }
    }

    // Add built-in /help command
    const helpCommand = createHelpCommand(this.client);
    allCommands.push(helpCommand);
    this.client.commands!.set(helpCommand.data.name, helpCommand);
    Log.info("registered built-in /help command");

    // Register commands with Discord
    if (allCommands.length > 0) {
      Log.wait("deploying commands to discord");
      try {
        const rest = new REST().setToken(this.application.bot!.token!);
        const commandsData = allCommands.map((cmd) => cmd.data.toJSON());

        await rest.put(Routes.applicationCommands(this.application.id!), {
          body: commandsData,
        });

        Log.ready(`deployed ${allCommands.length} command(s)`);
      } catch (error) {
        Log.error("failed to deploy commands:", error);
      }
    }

    // Handle command interactions
    this.client.on(Events.InteractionCreate, async (interaction) => {
      // Handle autocomplete
      if (interaction.isAutocomplete()) {
        const command = this.client.commands!.get(interaction.commandName);

        if (!command || !command.autocomplete) {
          return;
        }

        try {
          await command.autocomplete(interaction);
        } catch (error) {
          Log.error(
            `error in autocomplete for ${interaction.commandName}:`,
            error,
          );
        }
        return;
      }

      // Handle command execution
      if (!interaction.isChatInputCommand()) return;

      const command = this.client.commands!.get(interaction.commandName);

      if (!command) {
        Log.warn(`unknown command: ${interaction.commandName}`);
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        Log.error(`error executing command ${interaction.commandName}:`, error);
        const errorMessage = {
          content: "There was an error while executing this command!",
          ephemeral: true,
        };

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(errorMessage);
        } else {
          await interaction.reply(errorMessage);
        }
      }
    });

    this.client.on(Events.ClientReady, () => {
      Log.ready("client is ready");
    });

    await this.client.login(this.application.bot.token);
  }

  public stop() {
    this.client.destroy();
  }
}

process.on("unhandledRejection", async (reason, promise) => {
  Log.error("unhandled promise rejection", promise, "reason:", reason);
});

process.on("uncaughtException", async (error) => {
  Log.error("uncaught exception", error);
});

process.on("uncaughtExceptionMonitor", async (error, origin) => {
  Log.error("uncaught exception monitor", error, "origin:", origin);
});

export { merge };
export { default as capitalize } from "./utils/capitalize";
export * from "./utils/discord";
export { default as formatDuration } from "./utils/formatDuration";
export { default as isNumber } from "./utils/isNumber";
export { default as isString } from "./utils/isString";
export { default as Log, prefixes, type LogType } from "./utils/log";
export { default as pad } from "./utils/pad";
export { default as progressIndicator } from "./utils/progressIndicator";
export { default as reduceString } from "./utils/reduceString";

export type { DixtClient, DixtSlashCommandBuilder } from "./types";

export default dixt;
