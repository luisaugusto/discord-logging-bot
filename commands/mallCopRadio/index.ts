import { Command } from '../command';
import {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder
} from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { play } from './play';

enum SubCommand {
  PLAY = 'play'
  // SKIP = 'skip'
}

const subCommandActions: Record<
  SubCommand,
  (interaction: CommandInteraction) => void
> = {
  [SubCommand.PLAY]: play
};

export const mallCopRadio: Command = {
  data: new SlashCommandBuilder()
    .setName('mall-cop-radio')
    .setDescription('Music management')
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName(SubCommand.PLAY)
        .setDescription('Add music from YouTube to a queue and play it')
        .addStringOption(option =>
          option.setName('url').setDescription('YouTube URL').setRequired(true)
        )
    ),
  async execute(interaction) {
    if (!interaction.isCommand()) return;

    const subCommand = interaction.options.getSubcommand(true) as SubCommand;
    subCommandActions[subCommand](interaction);
  }
};
