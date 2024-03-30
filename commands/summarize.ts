import { Command } from "./command";
import { SlashCommandBuilder } from "@discordjs/builders";
import {
  convertDiscordMessagesToOpenAIMessages,
  openai,
} from "../utils/openAIConfig";
import { logtail } from "../utils/logtailConfig";

export const summarize: Command = {
  data: new SlashCommandBuilder()
    .setName("summarize")
    .setDescription("Get the TLDR of what has happened recently in a channel"),
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.channel === null) return;

    await interaction.reply({
      content: "Summarizing the channel...",
      ephemeral: true,
    });

    const prevMessages = await interaction.channel.messages.fetch({
      limit: 30,
    });

    const mappedMessages = convertDiscordMessagesToOpenAIMessages(prevMessages);

    try {
      const openAIResponse = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are an AI assistant on a discord server with a main purpose of summarizing channel information with a succinct yet detailed response.",
          },
          ...mappedMessages,
          {
            role: "user",
            content:
              "Summarize the above messages so that I can catch up on the latest conversation without having to read everything.",
          },
        ],
      });

      openAIResponse.choices.forEach((choice) => {
        const { message: choiceMessage } = choice;
        if (!choiceMessage?.content) return;

        const splitMessage = choiceMessage.content.match(/(.|[\r\n]){1,1500}/g);
        if (!splitMessage) return;
        Promise.all(
          splitMessage.map((chunk) => interaction.editReply(chunk)),
        ).catch(async (e) => {
          await logtail.error(
            "Error creating a message",
            JSON.parse(JSON.stringify(e)),
          );
        });
      });

      await logtail.info(
        interaction.channel.id,
        JSON.parse(JSON.stringify(openAIResponse)),
      );
    } catch (e) {
      await logtail.error(
        "Error creating a message",
        JSON.parse(JSON.stringify(e)),
      );
    }
  },
};
