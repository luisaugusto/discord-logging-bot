import type { Event } from './event';
import { openai } from '../utils/openAIConfig';
import { logtail } from '../utils/logtailConfig';
import { Message } from 'discord.js';

const checkForThread = async (message: Message<boolean>) => {
  if (Boolean(message.thread)) return;

  await message.startThread({
    name: 'Translations'
  });
};

const isValidContent = (content?: string): content is string => {
  if (content === 'unknown' || !content)
    throw new Error(`Could not find translation for ${name}`);

  return true;
};

export const messageReactionAdd: Event<'messageReactionAdd'> = {
  name: 'messageReactionAdd',
  async execute(reaction) {
    const name = reaction.emoji.name;
    // Check if the emoji is a country flag
    const reg = /\uD83C[\uDDE6-\uDDFF]\uD83C[\uDDE6-\uDDFF]/;
    if (!name || !reg.test(name)) return;
    const message = await reaction.message.fetch();
    const channel = message.channel;
    if (channel.isThread() || channel.isDMBased() || channel.isVoiceBased())
      return;

    try {
      const openAIResponse = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        temperature: 0,
        messages: [
          {
            role: 'user',
            content: `First, find the country from the emoji "${name}". If you cannot find a country, just say "unknown". If you find a country, translate the following text into that country's language. Respond only with a JSON object that includes the fields country_language, country, and translation: \n\n
            ${message.cleanContent}`
          }
        ]
      });

      await logtail.info(name, JSON.parse(JSON.stringify(openAIResponse.data)));

      const content = openAIResponse.data.choices[0].message?.content;
      console.log(content);
      if (!isValidContent(content)) return;
      await checkForThread(message);

      const {
        country_language,
        translation,
        country
      }: Record<'country_language' | 'translation' | 'country', string> =
        JSON.parse(content);
      if (!isValidContent(country)) return;
      const splitMessage = translation.match(/(.|[\r\n]){1,1800}/g);
      splitMessage?.map(chunk =>
        message.thread?.send(`**${name} ${country_language}**\n${chunk}`)
      );
    } catch (e) {
      await checkForThread(message);
      message.thread?.send(
        `Sorry, I encountered an error generating translation for the ${name} reaction. Try asking again. If the problem persists, please contact the server administrator.`
      );
      await logtail.error(
        'Error creating a message',
        JSON.parse(JSON.stringify(e))
      );
    }
  }
};
