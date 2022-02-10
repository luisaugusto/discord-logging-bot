import { CommandInteraction } from 'discord.js';
import ytdl from 'discord-ytdl-core';
import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  joinVoiceChannel
} from '@discordjs/voice';
import { channelMention } from '@discordjs/builders';

export const play = async (interaction: CommandInteraction) => {
  if (!interaction.guild) return;

  const user = interaction.user;
  const url = interaction.options.getString('url', true);
  const voiceStates = interaction.guild.voiceStates.cache;
  const activeVoiceState = voiceStates.find(
    state => state.member?.user === user
  );

  if (!activeVoiceState?.member?.voice.channel)
    return await interaction.reply({
      content: `You are not in a voice channel.`,
      ephemeral: true
    });

  if (!ytdl.validateURL(url))
    return await interaction.reply({
      content: `Sorry, I could not find that YouTube video :cry:`,
      ephemeral: true
    });

  const channelId = activeVoiceState.member.voice.channel.id;

  const prevConnection = getVoiceConnection(interaction.guild.id);
  const connection =
    prevConnection ||
    joinVoiceChannel({
      channelId,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator
    });

  // @todo: Save this in higher scope to access across subcommands
  const player = createAudioPlayer();
  connection.subscribe(player);

  const music = createAudioResource(
    ytdl(url, {
      filter: 'audioonly',
      opusEncoded: true
    })
  );

  player.play(music);

  player.on('error', err => {
    console.log(err);
    console.log(player.state);
  });

  player.on(AudioPlayerStatus.Idle, () => {
    console.log('now idle');
  });

  await interaction.reply({
    content: `Playing ${url} in the ${channelMention(channelId)} channel.`,
    ephemeral: true
  });
};
