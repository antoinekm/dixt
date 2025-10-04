#!/usr/bin/env node
import * as clack from "@clack/prompts";
import { execSync } from "child_process";
import { Command } from "commander";
import fs from "fs";
import Handlebars from "handlebars";
import path from "path";

// Get __dirname equivalent in CommonJS
const __dirname = __filename ? path.dirname(__filename) : process.cwd();

const program = new Command();

program
  .name("create-dixt-bot")
  .description("Create a new dixt Discord bot")
  .argument("[project-name]", "Name of your bot project")
  .action(async (projectName?: string) => {
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
          clack.confirm({
            message: "Use TypeScript?",
            initialValue: true,
          }),
        plugins: () =>
          clack.multiselect({
            message: "Select plugins to install (optional):",
            options: [
              { value: "dixt-plugin-logs", label: "Logs - Server logging" },
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
          clack.confirm({
            message: "Create an example plugin?",
            initialValue: true,
          }),
        packageManager: () =>
          clack.select({
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

    const projectPath = path.join(process.cwd(), options.projectName as string);

    // Check if directory exists
    if (fs.existsSync(projectPath)) {
      clack.cancel(`Directory ${options.projectName} already exists`);
      process.exit(1);
    }

    const s = clack.spinner();
    s.start("Creating project structure...");

    // Template data
    const templateData = {
      projectName: options.projectName,
      useTypeScript: options.useTypeScript,
      createExamplePlugin: options.createExamplePlugin,
      packageManager: options.packageManager,
    };

    // Create project directory
    fs.mkdirSync(projectPath, { recursive: true });

    // Create subdirectories
    fs.mkdirSync(path.join(projectPath, "src"), { recursive: true });
    if (options.createExamplePlugin) {
      fs.mkdirSync(path.join(projectPath, "plugins"), { recursive: true });
    }

    // Template directory
    const templatesDir = path.join(__dirname, "../templates");
    const langDir = options.useTypeScript ? "typescript" : "javascript";

    // Helper function to render and write template
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

    // Create package.json
    const packageJson = {
      name: options.projectName,
      version: "1.0.0",
      type: options.useTypeScript ? "module" : "commonjs",
      scripts: options.useTypeScript
        ? {
            dev: "tsx src/index.ts",
            build: "tsc",
            start: "node dist/index.js",
          }
        : {
            dev: "node src/index.js",
            start: "node src/index.js",
          },
      dependencies: {
        dixt: "^4.0.0",
        "discord.js": "^14.0.0",
        ...(options.plugins as string[]).reduce(
          (acc, plugin) => ({ ...acc, [plugin]: "^4.0.0" }),
          {},
        ),
      },
      devDependencies: options.useTypeScript
        ? {
            "@types/node": "^20.0.0",
            typescript: "^5.0.0",
            tsx: "^4.0.0",
          }
        : {},
    };

    fs.writeFileSync(
      path.join(projectPath, "package.json"),
      JSON.stringify(packageJson, null, 2),
    );

    // Create .env.example from template
    renderTemplate(
      path.join(templatesDir, "common", "env"),
      path.join(projectPath, ".env.example"),
      templateData,
    );

    // Create .gitignore from template
    renderTemplate(
      path.join(templatesDir, "common", "gitignore"),
      path.join(projectPath, ".gitignore"),
      templateData,
    );

    // Create main file from template
    const ext = options.useTypeScript ? "ts" : "js";
    renderTemplate(
      path.join(templatesDir, langDir, `index.${ext}`),
      path.join(projectPath, "src", `index.${ext}`),
      templateData,
    );

    // Create tsconfig if TypeScript
    if (options.useTypeScript) {
      fs.copyFileSync(
        path.join(templatesDir, "typescript", "tsconfig.json.template"),
        path.join(projectPath, "tsconfig.json"),
      );
    }

    // Create example plugin if requested
    if (options.createExamplePlugin) {
      renderTemplate(
        path.join(templatesDir, langDir, `my-plugin.${ext}`),
        path.join(projectPath, "plugins", `my-plugin.${ext}`),
        templateData,
      );
    }

    // Create README from template
    renderTemplate(
      path.join(templatesDir, "common", "README.md"),
      path.join(projectPath, "README.md"),
      templateData,
    );

    s.stop("Project created!");

    // Install dependencies
    const installSpinner = clack.spinner();
    installSpinner.start("Installing dependencies...");

    try {
      const pmCommands = {
        pnpm: "pnpm install",
        npm: "npm install",
        yarn: "yarn",
      };

      execSync(pmCommands[options.packageManager as keyof typeof pmCommands], {
        cwd: projectPath,
        stdio: "inherit",
      });

      installSpinner.stop("Dependencies installed!");
    } catch (error) {
      installSpinner.stop("Failed to install dependencies");
      clack.log.error("You can install them manually by running:");
      clack.log.info(
        `  cd ${options.projectName} && ${options.packageManager} install`,
      );
    }

    clack.outro("🎉 Your dixt bot is ready!");

    console.log("\nNext steps:");
    clack.log.step(`  cd ${options.projectName}`);
    clack.log.step("  Copy .env.example to .env and fill in your credentials");
    clack.log.step(`  ${options.packageManager}} run dev`);
  });

program.parse();
