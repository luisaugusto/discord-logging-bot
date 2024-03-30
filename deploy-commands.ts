import { report } from "./commands/report";
import { mallCopRadio } from "./commands/mallCopRadio";

import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { generateImage } from "./commands/generateImage";
import { logtail } from "./utils/logtailConfig";
import { summarize } from "./commands/summarize";
import { Command } from "./commands/command";

const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);
const commands: Command[] = [report, mallCopRadio, generateImage, summarize];
const commandsJSON = commands.map((command) => command.data.toJSON());

const commandsRoute = process.env.TEST_SERVER_ID
  ? Routes.applicationGuildCommands(
      process.env.CLIENT_ID,
      process.env.TEST_SERVER_ID,
    )
  : Routes.applicationCommands(process.env.CLIENT_ID);

rest
  .put(commandsRoute, {
    body: commandsJSON,
  })
  .then(() => logtail.debug("Successfully registered application commands."))
  .catch((err) =>
    logtail.error("Error registering application commands.", {
      error: JSON.stringify(err),
    }),
  );
