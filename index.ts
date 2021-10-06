require('dotenv').config();

import { ready } from './events/ready';
import { messageDelete } from './events/messageDelete';
import { voiceStateUpdate } from './events/voiceStateUpdate';
import { Client, Intents } from 'discord.js';
import type { Event } from './events/event';

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES
  ],
  partials: ['MESSAGE']
});

const events: Event<any>[] = [ready, messageDelete, voiceStateUpdate];

events.forEach(event => {
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
});

(() => client.login(process.env.TOKEN))();
