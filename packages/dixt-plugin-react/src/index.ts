import { Events, SlashCommandBuilder } from "discord.js";
import { DixtPlugin, DixtSlashCommandBuilder, Log, merge } from "dixt";
import dotenv from "dotenv-flow";

import { name } from "../package.json";

dotenv.config({
  silent: true,
});

export type DixtPluginReactOptions = {
  channels?: {
    id: string;
    emoji: string;
    matchs?: string[];
  }[];
};

export const optionsDefaults = {
  channels: [],
};

const dixtPluginReact: DixtPlugin = (
  instance,
  optionsValue?: DixtPluginReactOptions,
) => {
  const options = merge({}, optionsDefaults, optionsValue);
  if (options.channels.length === 0) {
    Log.error(`${name} - channels are empty`);
  }

  instance.client.on(Events.MessageCreate, async (message) => {
    (options.channels as DixtPluginReactOptions["channels"])?.forEach(
      async (channel) => {
        if (message.channel.id === channel.id) {
          if (channel.matchs && channel.matchs.length > 0) {
            channel.matchs.forEach((match) => {
              if (message.content.toLowerCase().includes(match.toLowerCase())) {
                message.react(channel.emoji);
              }
            });
          } else {
            message.react(channel.emoji);
          }
        }
      },
    );
  });

  // Example ping command
  const pingCommand: DixtSlashCommandBuilder = {
    data: new SlashCommandBuilder()
      .setName("ping")
      .setDescription("Replies with Pong!"),
    execute: async (interaction) => {
      const latency = Date.now() - interaction.createdTimestamp;
      await interaction.reply({
        content: `🏓 Pong! Latency: ${latency}ms`,
        ephemeral: true,
      });
    },
  };

  return {
    name,
    commands: [pingCommand],
  };
};

export default dixtPluginReact;
