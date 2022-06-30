import type { Event } from './event';
import { getLoggingChannel } from '../utils/getLoggingChannel';
import { userMention } from '@discordjs/builders';
import axios from 'axios';

export const guildMemberAdd: Event<'guildMemberAdd'> = {
  name: 'guildMemberAdd',
  async execute(member) {
    const welcomeChannel = await getLoggingChannel(
      member.guild.channels,
      process.env.WELCOME_CHANNEL
    );

    const gif = await axios.get<{ data: { id: string } }>(
      'https://api.giphy.com/v1/gifs/random',
      {
        params: {
          api_key: process.env.GIPHY_KEY,
          tag: 'hello',
          rating: 'pg-13'
        }
      }
    );

    await welcomeChannel.send({
      embeds: [
        {
          description: `Welcome ${userMention(member.id)}! The server now has ${
            member.guild.memberCount
          } members.`,
          image: {
            url: `https://media0.giphy.com/media/${gif.data.data.id}/giphy.gif`
          },
          timestamp: new Date()
        }
      ]
    });
  }
};
