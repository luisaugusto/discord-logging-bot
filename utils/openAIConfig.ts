import { OpenAI } from "openai";
import { Collection, Message } from "discord.js";
import { ChatCompletionMessageParam } from "openai/resources";

export const openai = new OpenAI({
  organization: process.env.OPENAI_ORG,
  apiKey: process.env.OPENAI_KEY,
});

export const convertDiscordMessagesToOpenAIMessages = (
  messages: Collection<string, Message>,
): ChatCompletionMessageParam[] =>
  messages
    .map<ChatCompletionMessageParam>((message) => {
      const params: ChatCompletionMessageParam = {
        role:
          message.author.id === message.client.user.id ? "assistant" : "user",
        content: `${message.author.displayName} - ${message.cleanContent}`,
      };
      return params;
    })
    .reverse();
