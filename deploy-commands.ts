import { report } from './commands/report';
import { mallCopRadio } from './commands/mallCopRadio';

require('dotenv').config();

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

rest
  .put(Routes.applicationCommands(process.env.CLIENT_ID), {
    body: [report.data, mallCopRadio.data].map(command => command.toJSON())
  })
  .then(() => console.log('Successfully registered application commands.'))
  .catch(console.error);
