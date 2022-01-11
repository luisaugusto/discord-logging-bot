import { report } from './commands/report';

require('dotenv').config();

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

rest
  .put(Routes.applicationCommands(process.env.CLIENT_ID), {
    body: [report.data].map(command => command.toJSON())
  })
  .then(() => console.log('Successfully registered application commands.'))
  .catch(console.error);
