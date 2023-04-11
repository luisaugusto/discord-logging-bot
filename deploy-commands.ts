import { report } from './commands/report';
import { mallCopRadio } from './commands/mallCopRadio';
import { config } from 'dotenv';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { generateImage } from './commands/generateImage';

config();

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

rest
  .put(Routes.applicationCommands(process.env.CLIENT_ID), {
    body: [report.data, mallCopRadio.data, generateImage.data].map(command =>
      command.toJSON()
    )
  })
  .then(() => console.info('Successfully registered application commands.'))
  .catch(console.error);
