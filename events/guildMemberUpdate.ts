import type { Event } from './event';
import { getLoggingChannel } from '../utils/getLoggingChannel';
import { userMention } from '@discordjs/builders';
import getGif from '../utils/getGif';

export const guildMemberUpdate: Event<'guildMemberUpdate'> = {
  name: 'guildMemberUpdate',
  async execute(oldMember, newMember) {
    if (oldMember.premiumSince !== null || newMember.premiumSince === null)
      return;

    const generalChannel = await getLoggingChannel(
      newMember.guild.channels,
      '💬general'
    );

    const gif = await getGif({ id: 'xT39DndqIF1Xn1Om3e' });

    await generalChannel.send({
      content: `YOOOOOO CAN I GET SOME POGS IN THE CHAT??? ${userMention(
        newMember.id
      )} JUST BOOSTED THE SERVER 🥳🚀🔥`,
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
