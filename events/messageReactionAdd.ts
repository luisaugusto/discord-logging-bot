import type { Event } from "./event";
import { openai } from "../utils/openAIConfig";
import { logtail } from "../utils/logtailConfig";
import { Message, NewsChannel, TextChannel } from "discord.js";

const checkForThread = async (message: Message) => {
  if (message.thread) return;

  await message.startThread({
    name: "Translations",
  });
};

const isValidName = (name: string | null): name is string => {
  // Check if the emoji is a country flag
  const reg = /\uD83C[\uDDE6-\uDDFF]\uD83C[\uDDE6-\uDDFF]/;
  return Boolean(name && reg.test(name));
};

const isValidContent = (
  name: string,
  content: unknown,
): content is Record<
  "country_language" | "translation" | "country",
  string
> => {
  if (typeof content !== "object" || content === null) return false;
  if (!("country_language" in content)) return false;
  if (!("translation" in content)) return false;
  if (!("country" in content)) return false;
  if (!Object.values(content).every((value) => typeof value === "string"))
    return false;
  return content.country !== "unknown";
};

const isValidChannel = (
  channel: Message["channel"],
): channel is NewsChannel | TextChannel =>
  !channel.isThread() && !channel.isDMBased() && !channel.isVoiceBased();

export const messageReactionAdd: Event<"messageReactionAdd"> = {
  name: "messageReactionAdd",
  async execute(partialReaction) {
    const reaction = await partialReaction.fetch();

    if (reaction.count > 1) return;
    const name = reaction.emoji.name;
    if (!isValidName(name)) return;
    const message = await reaction.message.fetch();
    if (message.system) return;

    const channel = message.channel;
    if (!isValidChannel(channel)) return;

    try {
      const openAIResponse = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        temperature: 0,
        messages: [
          {
            role: "user",
            content: `First, find the country from the emoji "${name}". If you cannot find a country, just say "unknown". If you find a country, translate the following text into that country's language. Respond only with a JSON object that includes the fields country_language, country, and translation: \n\n
            ${message.cleanContent}`,
          },
        ],
      });

      await logtail.info(name, JSON.parse(JSON.stringify(openAIResponse.data)));

      const content = openAIResponse.data.choices[0].message?.content;
      console.log(content);
      await checkForThread(message);

      const parsedContent: unknown = JSON.parse(String(content));
      if (!isValidContent(name, parsedContent)) return;

      const { country_language, translation } = parsedContent;
      const splitMessage = translation.match(/(.|[\r\n]){1,1800}/g);
      splitMessage?.map(
        (chunk) =>
          message.thread?.send(`**${name} ${country_language}**\n${chunk}`),
      );
    } catch (e) {
      await checkForThread(message);
      await message.thread?.send(
        `Sorry, I encountered an error generating translation for the ${name} reaction. Try asking again. If the problem persists, please contact the server administrator.`,
      );
      await logtail.error(
        "Error creating a message",
        JSON.parse(JSON.stringify(e)),
      );
    }
  },
};
