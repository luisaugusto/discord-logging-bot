import type { Event } from './event';
import { getLoggingChannel } from '../utils/getLoggingChannel';

export const voiceStateUpdate: Event<'voiceStateUpdate'> = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState) {
    const channel = await getLoggingChannel(oldState.guild.channels);
    if (!channel) return;

    if (newState.channelId === oldState.channelId) return;

    // https://stackoverflow.com/questions/71344815/how-would-i-detect-when-a-user-is-speaking-in-a-voice-channel-discord-js-v13
    if (newState.channelId && newState.member) {
      if (oldState.channelId) {
        await channel.send(
          `<@${newState.member.id}> has left <#${oldState.channelId}> and joined <#${newState.channelId}>.`
        );
      } else {
        await channel.send(
          `<@${newState.member.id}> has joined <#${newState.channelId}>.`
        );
      }
    } else {
      await channel.send(
        `<@${oldState.member?.id}> has left <#${oldState.channelId}>.`
      );
    }
  }
};
