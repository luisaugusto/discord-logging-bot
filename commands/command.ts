import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

interface MessageApplicationData {
  name: string;
  type: 3;
}

interface MessageApplication extends MessageApplicationData {
  toJSON(): MessageApplicationData;
}

export const createMessageApplication = (name: string): MessageApplication => ({
  name,
  type: 3,
  toJSON: () => ({
    name,
    type: 3
  })
});

export interface Command {
  data:
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
    | MessageApplication;
  execute(interaction: CommandInteraction): void;
}
