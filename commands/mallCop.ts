import { Command } from './command';
import { SlashCommandBuilder, channelMention } from '@discordjs/builders';
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource
} from '@discordjs/voice';
import ytdl from 'ytdl-core-discord';

export const mallCop: Command = {
  data: new SlashCommandBuilder()
    .setName('mall-cop')
    .setDescription('Play some music')
    .addStringOption(option =>
      option.setName('url').setDescription('YouTube URL').setRequired(true)
    ),
  async execute(interaction) {
    if (!interaction.guild) return;
    const user = interaction.user;
    const url = interaction.options.get('url', true).value as string;

    const voiceStates = interaction.guild.voiceStates.cache;
    const activeVoiceState = voiceStates.find(
      state => state.member?.user === user
    );

    if (activeVoiceState?.member?.voice.channel) {
      const channelId = activeVoiceState.member.voice.channel.id;

      const connection = joinVoiceChannel({
        channelId,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator
      });

      const player = createAudioPlayer();
      connection.subscribe(player);

      if (!ytdl.validateURL(url))
        return await interaction.reply({
          content: `Cannot find the YouTube video`,
          ephemeral: true
        });

      const music = createAudioResource(await ytdl(url));
      player.play(music);

      await interaction.reply({
        content: `Joined the ${channelMention(channelId)} channel.`,
        ephemeral: true
      });
    } else {
      await interaction.reply({
        content: `You are not in a voice channel.`,
        ephemeral: true
      });
    }
  }
};
