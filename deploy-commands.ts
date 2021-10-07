import { report } from './commands/report';

require('dotenv').config();

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const commands = [report.data];

const commandsJSON = commands.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

rest
  .put(Routes.applicationCommands(process.env.CLIENT_ID), {
    body: commandsJSON
  })
  .then(() => console.log('Successfully registered application commands.'))
  .catch(console.error);
