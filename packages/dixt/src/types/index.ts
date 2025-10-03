import {
  AutocompleteInteraction,
  CacheType,
  ChatInputCommandInteraction,
  Client,
  Collection,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from "discord.js";

export type DixtSlashCommandBuilder = {
  data:
    | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
    | SlashCommandOptionsOnlyBuilder;
  execute: (_interaction: ChatInputCommandInteraction<CacheType>) => void;
  autocomplete?: (_interaction: AutocompleteInteraction<CacheType>) => void;
};

export type DixtClient = Client<boolean> & {
  commands?: Collection<string, DixtSlashCommandBuilder>;
};
