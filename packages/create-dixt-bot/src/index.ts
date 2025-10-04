#!/usr/bin/env node
import * as clack from "@clack/prompts";
import { execSync } from "child_process";
import { Command } from "commander";
import fs from "fs";
import Handlebars from "handlebars";
import path from "path";

declare const __dirname: string;

const createSpinner = () => {
  try {
    return clack.spinner();
  } catch {
    return {
      start: (msg: string) => console.log(msg),
      stop: (msg: string) => console.log(msg),
    };
  }
};

const getLatestVersion = async (packageName: string): Promise<string> => {
  try {
    const response = await fetch(
      `https://registry.npmjs.org/${packageName}/latest`,
    );
    const data = await response.json();
    return `^${data.version}`;
  } catch {
    return "latest";
  }
};

const program = new Command();

program
  .name("create-dixt-bot")
  .description("Create a new dixt Discord bot")
  .argument("[project-name]", "Name of your bot project")
  .option("--typescript", "Use TypeScript")
  .option("--javascript", "Use JavaScript")
  .option("--pm <manager>", "Package manager (pnpm, npm, yarn)")
  .option("--plugins <plugins...>", "Plugins to install (space-separated)")
  .option("--no-plugins", "Don't install any plugins")
  .option("--no-example", "Don't create example plugin")
  .option("--skip-install", "Skip dependency installation")
  .option("--skip-env", "Skip Discord credentials setup")
  .action(
    async (
      projectName?: string,
      cmdOptions?: {
        typescript?: boolean;
        javascript?: boolean;
        pm?: string;
        plugins?: string[] | boolean;
        example?: boolean;
        skipInstall?: boolean;
        skipEnv?: boolean;
      },
    ) => {
      try {
        console.clear();

        clack.intro("🔌 Create Dixt Bot");

        const options = await clack.group(
          {
            projectName: () =>
              projectName
                ? Promise.resolve(projectName)
                : clack.text({
                    message: "What is your bot name?",
                    placeholder: "my-discord-bot",
                    validate: (value) => {
                      if (!value) return "Please enter a bot name";
                      if (!/^[a-z0-9-]+$/.test(value))
                        return "Name must be lowercase letters, numbers, and hyphens only";
                      return undefined;
                    },
                  }),
            useTypeScript: () =>
              cmdOptions?.typescript !== undefined ||
              cmdOptions?.javascript !== undefined
                ? Promise.resolve(cmdOptions?.typescript ?? true)
                : clack.confirm({
                    message: "Use TypeScript?",
                    initialValue: true,
                  }),
            plugins: () =>
              cmdOptions &&
              ("plugins" in cmdOptions || cmdOptions.plugins === false)
                ? Promise.resolve(
                    cmdOptions.plugins === false
                      ? []
                      : cmdOptions.plugins || [],
                  )
                : clack.multiselect({
                    message: "Select plugins to install (optional):",
                    options: [
                      {
                        value: "dixt-plugin-logs",
                        label: "Logs - Server logging",
                      },
                      {
                        value: "dixt-plugin-roles",
                        label: "Roles - Self-assignable roles",
                      },
                      {
                        value: "dixt-plugin-join",
                        label: "Join - Welcome messages",
                      },
                      {
                        value: "dixt-plugin-react",
                        label: "React - Auto-react to messages",
                      },
                      {
                        value: "dixt-plugin-presence",
                        label: "Presence - Custom bot status",
                      },
                    ],
                    required: false,
                  }),
            createExamplePlugin: () =>
              cmdOptions?.example !== undefined
                ? Promise.resolve(cmdOptions?.example)
                : clack.confirm({
                    message: "Create an example plugin?",
                    initialValue: true,
                  }),
            packageManager: () =>
              cmdOptions?.pm !== undefined
                ? Promise.resolve(cmdOptions?.pm)
                : clack.select({
                    message: "Which package manager?",
                    options: [
                      { value: "pnpm", label: "pnpm" },
                      { value: "npm", label: "npm" },
                      { value: "yarn", label: "yarn" },
                    ],
                    initialValue: "pnpm",
                  }),
          },
          {
            onCancel: () => {
              clack.cancel("Operation cancelled");
              process.exit(0);
            },
          },
        );

        const projectPath = path.join(
          process.cwd(),
          options.projectName as string,
        );

        if (fs.existsSync(projectPath)) {
          clack.cancel(`Directory ${options.projectName} already exists`);
          process.exit(1);
        }

        const s = createSpinner();
        s.start("Creating project structure...");

        const templateData = {
          projectName: options.projectName,
          useTypeScript: options.useTypeScript,
          createExamplePlugin: options.createExamplePlugin,
          packageManager: options.packageManager,
        };

        fs.mkdirSync(projectPath, { recursive: true });
        fs.mkdirSync(path.join(projectPath, "src"), { recursive: true });
        if (options.createExamplePlugin) {
          fs.mkdirSync(path.join(projectPath, "plugins"), { recursive: true });
        }

        const templatesDir = path.join(__dirname, "../templates");
        const langDir = options.useTypeScript ? "typescript" : "javascript";

        const renderTemplate = (
          templatePath: string,
          outputPath: string,
          data: Record<string, string | boolean | string[]>,
        ) => {
          const templateContent = fs.readFileSync(templatePath, "utf-8");
          const template = Handlebars.compile(templateContent);
          const rendered = template(data);
          fs.writeFileSync(outputPath, rendered);
        };

        const dixtVersion = await getLatestVersion("dixt");
        const pluginVersions = await Promise.all(
          (options.plugins as string[]).map(async (plugin) => ({
            name: plugin,
            version: await getLatestVersion(plugin),
          })),
        );
        const packageJson = {
          name: options.projectName,
          version: "1.0.0",
          type: options.useTypeScript ? "module" : "commonjs",
          scripts: options.useTypeScript
            ? {
                dev: "dixt dev",
                build: "dixt build",
                start: "dixt start",
              }
            : {
                dev: "dixt dev",
                start: "dixt start",
              },
          dependencies: {
            dixt: dixtVersion,
            "discord.js": "^14.0.0",
            ...pluginVersions.reduce(
              (acc, { name, version }) => ({ ...acc, [name]: version }),
              {},
            ),
          },
          devDependencies: options.useTypeScript
            ? {
                "@types/node": "^20.0.0",
                typescript: "^5.0.0",
              }
            : {},
        };

        fs.writeFileSync(
          path.join(projectPath, "package.json"),
          JSON.stringify(packageJson, null, 2),
        );

        renderTemplate(
          path.join(templatesDir, "common", "env.template"),
          path.join(projectPath, ".env.example"),
          templateData,
        );

        renderTemplate(
          path.join(templatesDir, "common", "gitignore.template"),
          path.join(projectPath, ".gitignore"),
          templateData,
        );

        const ext = options.useTypeScript ? "ts" : "js";
        renderTemplate(
          path.join(templatesDir, langDir, `index.${ext}.template`),
          path.join(projectPath, "src", `index.${ext}`),
          templateData,
        );

        if (options.useTypeScript) {
          renderTemplate(
            path.join(templatesDir, "typescript", "tsconfig.json.template"),
            path.join(projectPath, "tsconfig.json"),
            templateData,
          );
        }

        if (options.createExamplePlugin) {
          renderTemplate(
            path.join(templatesDir, langDir, `my-plugin.${ext}.template`),
            path.join(projectPath, "plugins", `my-plugin.${ext}`),
            templateData,
          );
        }

        renderTemplate(
          path.join(templatesDir, "common", "README.md.template"),
          path.join(projectPath, "README.md"),
          templateData,
        );

        s.stop("Project created!");

        if (!cmdOptions?.skipEnv) {
          console.log("");
          clack.note(
            `To get your Discord credentials:

1. Go to https://discord.com/developers/applications
2. Click "New Application" and give it a name
3. Go to "General Information" → Copy your Application ID
4. Go to "Bot" → Click "Add Bot" if needed
5. Under "Token" → Click "Reset Token" → Copy the token
6. Enable "Message Content Intent" under Privileged Gateway Intents`,
            "📝 Discord Setup Guide",
          );
          console.log("");

          const envConfig = await clack.group(
            {
              setupNow: () =>
                clack.confirm({
                  message:
                    "Do you want to configure your Discord credentials now?",
                  initialValue: true,
                }),
              applicationId: ({ results }) =>
                results.setupNow
                  ? clack.text({
                      message: "Discord Application ID:",
                      placeholder: "123456789012345678",
                      validate: (value) => {
                        if (!value) return "Application ID is required";
                        if (!/^\d+$/.test(value))
                          return "Application ID must be numeric";
                        return undefined;
                      },
                    })
                  : Promise.resolve(""),
              botToken: ({ results }) =>
                results.setupNow
                  ? clack.text({
                      message: "Discord Bot Token:",
                      placeholder: "Your bot token here",
                      validate: (value) => {
                        if (!value) return "Bot token is required";
                        return undefined;
                      },
                    })
                  : Promise.resolve(""),
            },
            {
              onCancel: () => {
                clack.cancel("Skipping credentials setup");
              },
            },
          );

          if (!clack.isCancel(envConfig) && envConfig.setupNow) {
            const envContent = `DIXT_APPLICATION_ID=${envConfig.applicationId}
DIXT_APPLICATION_NAME=${options.projectName}
DIXT_BOT_TOKEN=${envConfig.botToken}
`;
            fs.writeFileSync(path.join(projectPath, ".env"), envContent);
            clack.log.success("✓ Created .env file with your credentials");
          } else {
            clack.log.info(
              "→ Don't forget to copy .env.example to .env and fill in your credentials",
            );
          }
        }

        if (!cmdOptions?.skipInstall) {
          const installSpinner = createSpinner();
          installSpinner.start("Installing dependencies...");

          try {
            const pmCommands = {
              pnpm: "pnpm install",
              npm: "npm install",
              yarn: "yarn",
            };

            execSync(
              pmCommands[options.packageManager as keyof typeof pmCommands],
              {
                cwd: projectPath,
                stdio: "inherit",
              },
            );

            installSpinner.stop("Dependencies installed!");
          } catch (error) {
            installSpinner.stop("Failed to install dependencies");
            clack.log.error("You can install them manually by running:");
            clack.log.info(
              `  cd ${options.projectName} && ${options.packageManager} install`,
            );
          }
        }

        clack.outro("🎉 Your dixt bot is ready!");

        console.log("\nNext steps:");
        clack.log.step(`  cd ${options.projectName}`);
        clack.log.step(
          "  Get your bot credentials from https://discord.com/developers/applications",
        );
        clack.log.step(
          "  Copy .env.example to .env and fill in your credentials",
        );
        clack.log.step(`  ${options.packageManager} install`);
        clack.log.step(`  ${options.packageManager} run dev`);
        console.log("\n📖 Check the README.md for detailed setup instructions");
      } catch (error) {
        console.error(
          "\nError:",
          error instanceof Error ? error.message : error,
        );
        process.exit(1);
      }
    },
  );

program.parse();
