import type { Event } from "./event";
import { ActivityType } from "discord-api-types/v10";
import createAnniversaryMessages from "../utils/createAnniversaryMessages";
import { logtail } from "../utils/logtailConfig";

export const ready: Event<"ready"> = {
  name: "ready",
  once: true,
  async execute(client) {
    await logtail.debug(`Logged in as ${client.user.tag}!`);
    console.log(`Logged in as ${client.user.tag}!`);
    await createAnniversaryMessages(client);

    client.user.setPresence({
      activities: [
        {
          type: ActivityType.Watching,
          name: "You (v2.5.8)",
        },
      ],
    });
  },
};
