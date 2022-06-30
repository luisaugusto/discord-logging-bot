import type { Event } from './event';
import { getLoggingChannel } from '../utils/getLoggingChannel';
import axios from 'axios';
import { userMention } from '@discordjs/builders';

export const guildMemberUpdate: Event<'guildMemberUpdate'> = {
  name: 'guildMemberUpdate',
  async execute(oldMember, newMember) {
    if (oldMember.premiumSince !== null || newMember.premiumSince === null)
      return;

    const generalChannel = await getLoggingChannel(
      newMember.guild.channels,
      '💬general'
    );

    const gif = await axios.get<{ data: { id: string } }>(
      'https://api.giphy.com/v1/gifs/xT39DndqIF1Xn1Om3e',
      {
        params: {
          api_key: process.env.GIPHY_KEY
        }
      }
    );

    await generalChannel.send({
      content: `YOOOOOO CAN I GET SOME POGS IN THE CHAT??? ${userMention(
        newMember.id
      )} JUST BOOSTED THE SERVER 🥳🚀🔥`,
      embeds: [
        {
          image: {
            url: `https://media0.giphy.com/media/${gif.data.data.id}/giphy.gif`
          },
          timestamp: new Date()
        }
      ]
    });
  }
};
