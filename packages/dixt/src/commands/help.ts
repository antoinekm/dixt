import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

import type { DixtClient, DixtSlashCommandBuilder } from "../types";

interface CommandOption {
  name: string;
  description: string;
  required?: boolean;
}

export const createHelpCommand = (
  client: DixtClient,
): DixtSlashCommandBuilder => {
  return {
    data: new SlashCommandBuilder()
      .setName("help")
      .setDescription("List all commands or get info about a specific command")
      .addStringOption((option) =>
        option
          .setName("command")
          .setDescription("The command to get help for")
          .setRequired(false)
          .setAutocomplete(true),
      ),
    execute: async (interaction) => {
      const commandName = interaction.options.getString("command");

      if (commandName) {
        // Show specific command help
        const command = client.commands!.get(commandName);

        if (!command) {
          await interaction.reply({
            content: `Command \`${commandName}\` not found.`,
            ephemeral: true,
          });
          return;
        }

        const embed = new EmbedBuilder()
          .setTitle(`Command: /${command.data.name}`)
          .setDescription(command.data.description)
          .setColor(0x5865f2);

        // Add options if any
        if (command.data.options && command.data.options.length > 0) {
          const optionsText = command.data.options
            .map((opt) => {
              const option = opt as unknown as CommandOption;
              const required = option.required ? "**required**" : "optional";
              return `\`${option.name}\` (${required}) - ${option.description}`;
            })
            .join("\n");
          embed.addFields({ name: "Options", value: optionsText });
        }

        await interaction.reply({ embeds: [embed], ephemeral: true });
      } else {
        // List all commands
        const embed = new EmbedBuilder()
          .setTitle("Help")
          .setDescription(
            "Use `/help <command>` to get information about a specific command.",
          )
          .setColor(0x5865f2);

        const commandsList = Array.from(client.commands!.values())
          .map((cmd) => `\`/${cmd.data.name}\` - ${cmd.data.description}`)
          .join("\n");

        embed.addFields({ name: "Available Commands", value: commandsList });

        await interaction.reply({ embeds: [embed], ephemeral: true });
      }
    },
    autocomplete: async (interaction) => {
      const focusedValue = interaction.options.getFocused().toLowerCase();
      const choices = Array.from(client.commands!.keys());
      const filtered = choices
        .filter((choice) => choice.toLowerCase().includes(focusedValue))
        .slice(0, 25); // Discord limits to 25 choices

      await interaction.respond(
        filtered.map((choice) => ({ name: choice, value: choice })),
      );
    },
  };
};
