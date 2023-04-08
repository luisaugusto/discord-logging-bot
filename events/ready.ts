import type { Event } from './event';
import { ActivityType } from 'discord-api-types/v10';
import createAnniversaryMessages from '../utils/createAnniversaryMessages';

export const ready: Event<'ready'> = {
  name: 'ready',
  once: true,
  async execute(client) {
    createAnniversaryMessages(client);

    client.user.setPresence({
      activities: [
        {
          type: ActivityType.Watching,
          name: 'You (v2.1.0)'
        }
      ]
    });
  }
};
