import type { Event } from './event';
import { getLoggingChannel } from '../utils/getLoggingChannel';

export const voiceStateUpdate: Event<'voiceStateUpdate'> = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState) {
    const channel = await getLoggingChannel(oldState.guild.channels);
    if (!channel) return;

    if (newState.channelId === oldState.channelId) return;

    if (newState.channelId && newState.member) {
      if (oldState.channelId) {
        channel.send(
          `<@${newState.member.id}> has left <#${oldState.channelId}> and joined <#${newState.channelId}>.`
        );
      } else {
        channel.send(
          `<@${newState.member.id}> has joined <#${newState.channelId}>.`
        );
      }
    } else {
      channel.send(
        `<@${oldState.member?.id}> has left <#${oldState.channelId}>.`
      );
    }
  }
};
