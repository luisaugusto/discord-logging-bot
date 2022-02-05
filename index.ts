import { guildMemberUpdate } from './events/guildMemberUpdate';

require('dotenv').config();

import { ready } from './events/ready';
import { guildMemberAdd } from './events/guildMemberAdd';
import { messageDelete } from './events/messageDelete';
import { messageCreate } from './events/messageCreate';
import { voiceStateUpdate } from './events/voiceStateUpdate';
import { report } from './commands/report';
import { Client, Intents } from 'discord.js';
import type { Event } from './events/event';
import { mallCop } from './commands/mallCop';

const client = new Client({
  // https://discord.com/developers/docs/topics/gateway#list-of-intents
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES
  ],
  // https://discordjs.guide/popular-topics/partials.html#enabling-partials
  // used for the message delete event
  partials: ['MESSAGE', 'CHANNEL']
});

const events: Event<any>[] = [
  ready,
  guildMemberAdd,
  guildMemberUpdate,
  messageCreate,
  messageDelete,
  voiceStateUpdate
];

events.forEach(event => {
  // The ready event should only run once, when the app is ready
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
});

const commands = [report, mallCop];

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand() && !interaction.isContextMenu()) return;
  const { commandName } = interaction;

  const command = commands.find(({ data }) => data.name === commandName);

  if (!command) return;
  command.execute(interaction);
});

(() => client.login(process.env.TOKEN))();
