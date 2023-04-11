import type { Event } from './event';
import { getLoggingChannel } from '../utils/getLoggingChannel';
import { userMention } from '@discordjs/builders';
import getGif from '../utils/getGif';

export const guildMemberAdd: Event<'guildMemberAdd'> = {
  name: 'guildMemberAdd',
  async execute(member) {
    const welcomeChannel = await getLoggingChannel(
      member.guild.channels,
      process.env.WELCOME_CHANNEL
    );

    const gif = await getGif({
      tag: 'hello',
      rating: 'pg-13'
    });

    await welcomeChannel.send({
      content: `Welcome ${userMention(member.id)}! The server now has ${
        member.guild.memberCount
      } members.`,
      embeds: gif
        ? [
            {
              image: {
                url: gif
              },
              timestamp: new Date().toISOString()
            }
          ]
        : undefined
    });
  }
};
