import { Message } from "discord.js";
import { openai } from "./openAIConfig";
import { getLoggingChannel } from "./getLoggingChannel";
import { createMessage } from "./createMessage";
import OpenAI from "openai";
import Moderation = OpenAI.Moderation;
import { logtail } from "./logtailConfig";

export const checkModeration = async (m: Message) => {
  const message = await m.fetch();

  if (!message.guild) return;
  try {
    const moderationResponse = await openai.moderations.create({
      input: message.cleanContent,
    });

    const result = moderationResponse.results[0];

    if (!result.flagged) return;

    const channel = await getLoggingChannel(
      message.guild.channels,
      process.env.REPORTS_CHANNEL,
    );

    const reason: string[] = [];

    for (const category in result.categories) {
      if (!result.categories[category as keyof Moderation.Categories]) continue;
      const percentage = Math.floor(
        result.category_scores[category as keyof Moderation.Categories] * 100,
      );
      reason.push(`${category}: ${percentage}%`);
    }

    const author = await message.guild.members.fetch(message.author.id);
    await author.timeout(60_000 * 2, "Message flagged by FBI Bot");

    await channel.send(
      createMessage(
        message,
        `:rotating_light: ${String(
          message.guild.roles.everyone,
        )} I've automatically reported a message that potentially violates moderation policies in ${
          message.url
        }. The author has been timed out for 2 minutes.`,
        [{ name: "Reason for Reporting:", value: reason.join("\n") }],
      ),
    );
  } catch (e) {
    await logtail.error(
      "Error checking moderation",
      JSON.parse(JSON.stringify(e)),
    );
  }
};
