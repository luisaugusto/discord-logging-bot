import { guildMemberUpdate } from "./events/guildMemberUpdate";

import { ready } from "./events/ready";
import { guildMemberAdd } from "./events/guildMemberAdd";
import { messageDelete } from "./events/messageDelete";
import { messageCreate } from "./events/messageCreate";
import { voiceStateUpdate } from "./events/voiceStateUpdate";
import { report } from "./commands/report";
import { Client, ClientEvents, GatewayIntentBits, Partials } from "discord.js";
import type { Event } from "./events/event";
import { generateImage } from "./commands/generateImage";
import { copyEvent } from "./commands/copyEvent";
import { messageReactionAdd } from "./events/messageReactionAdd";
import { logtail } from "./utils/logtailConfig";
import { summarize } from "./commands/summarize";

const client = new Client({
  // https://discord.com/developers/docs/topics/gateway#list-of-intents
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
  ],
  // https://discordjs.guide/popular-topics/partials.html#enabling-partials
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const events: Event<keyof ClientEvents>[] = [
  ready,
  guildMemberAdd,
  guildMemberUpdate,
  messageCreate,
  messageDelete,
  voiceStateUpdate,
  messageReactionAdd,
];

events.forEach((event) => {
  // The ready event should only run once, when the app is ready
  if (event.once)
    client.once(event.name, (...args) => {
      event.execute(...args).catch(async (e) => {
        await logtail.error(
          "Error setting up once command",
          JSON.parse(JSON.stringify(e)),
        );
      });
    });
  else
    client.on(event.name, (...args) => {
      event.execute(...args).catch(async (e) => {
        await logtail.error(
          "Error setting up repeatable command",
          JSON.parse(JSON.stringify(e)),
        );
      });
    });
});

const commands = [report, generateImage, summarize, copyEvent];

client.on("interactionCreate", (interaction) => {
  if (!interaction.isContextMenuCommand() && !interaction.isChatInputCommand())
    return;
  const { commandName } = interaction;

  const command = commands.find(({ data }) => data.name === commandName);
  command?.execute(interaction).catch(async (e) => {
    await logtail.error(
      "Error interacting with command",
      JSON.parse(JSON.stringify(e)),
    );
  });
});

(() => {
  client
    .login(process.env.TOKEN)
    .catch((err) =>
      logtail.error(
        "Could not login to Discord.",
        JSON.parse(JSON.stringify(err)),
      ),
    );
})();
