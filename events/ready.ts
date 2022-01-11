import type { Event } from './event';
import { getLoggingChannel } from '../utils/getLoggingChannel';
import { channelMention, inlineCode } from '@discordjs/builders';

export const ready: Event<'ready'> = {
  name: 'ready',
  once: true,
  async execute(client) {
    client.user.setPresence({
      activities: [
        {
          type: 'WATCHING',
          name: 'you'
        }
      ]
    });

    const guilds = await client.guilds.fetch();

    guilds.forEach(guild => {
      guild.fetch().then(async ({ channels }) => {
        const logChannel = await getLoggingChannel(channels);
        const welcomeChannel = await getLoggingChannel(
          channels,
          process.env.WELCOME_CHANNEL
        );

        logChannel?.send(
          `Hello there! Back from my time off with a few new updates ${inlineCode(
            'v1.1.0'
          )}: \n\n 1. I will now send a message whenever I go online (like this). \n 2. I will now welcome users in the ${channelMention(
            welcomeChannel.id
          )} channel with a gif \n 3. Whenever the phrase "GAS PEDAL" is mentioned, I will also send GAS PEDAL to help the cause :race_car:`
        );
      });
    });
  }
};
