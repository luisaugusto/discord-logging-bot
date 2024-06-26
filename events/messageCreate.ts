import type { Event } from "./event";
import {
  convertDiscordMessagesToOpenAIMessages,
  openai,
} from "../utils/openAIConfig";
import { logtail } from "../utils/logtailConfig";
// import { checkModeration } from "../utils/checkModeration";

export const messageCreate: Event<"messageCreate"> = {
  name: "messageCreate",
  async execute(message) {
    if (message.author.bot) return;

    // await checkModeration(message);

    // If the bot is mentioned, respond with a message
    if (!message.mentions.users.has(message.client.user.id)) return;

    const prevMessages = await message.channel.messages.fetch({ limit: 20 });
    const mappedMessages = convertDiscordMessagesToOpenAIMessages(prevMessages);

    try {
      const openAIResponse = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are an AI assistant on a discord server with light-hearted and comedic personality",
          },
          ...mappedMessages,
        ],
      });

      await logtail.info(
        message.cleanContent,
        JSON.parse(JSON.stringify(openAIResponse)),
      );

      openAIResponse.choices.forEach((choice) => {
        const { message: choiceMessage } = choice;
        if (!choiceMessage?.content) return;

        const splitMessage = choiceMessage.content.match(/(.|[\r\n]){1,1500}/g);
        if (!splitMessage) return;
        Promise.all(
          splitMessage.map((chunk) => message.channel.send(chunk)),
        ).catch(async (e) => {
          await logtail.error(
            "Error creating a message",
            JSON.parse(JSON.stringify(e)),
          );
        });
      });
    } catch (e) {
      await message.channel.send(
        "Sorry, I encountered an error. Try asking again. If the problem persists, please contact the server administrator.",
      );
      await logtail.error(
        "Error creating a message",
        JSON.parse(JSON.stringify(e)),
      );
    }
  },
};
