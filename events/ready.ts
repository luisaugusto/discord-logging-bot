import type { Event } from './event';

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
  }
};
