import type { Event } from './event';
import { openai } from '../utils/openAIConfig';
import { ChatCompletionRequestMessage } from 'openai';

export const messageCreate: Event<'messageCreate'> = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot) return;
    if (!message.mentions.users.has(message.client.user.id)) return;

    const prevMessages = await message.channel.messages.fetch({ limit: 20 });

    // For some reason, I can't map the messages in the response
    const mappedMessages: ChatCompletionRequestMessage[] = [];
    prevMessages.forEach(message => {
      mappedMessages.unshift({
        role:
          message.author.id === message.client.user.id ? 'assistant' : 'user',
        content: message.cleanContent
      });
    });

    try {
      const openAIResponse = await openai
        .createChatCompletion({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content:
                'You are an AI assistant on a discord server with light-hearted and comedic personality'
            },
            ...mappedMessages
          ]
        })
        .catch(err => console.error(JSON.stringify(err)));

      if (!openAIResponse) return;
      console.info(message.cleanContent);
      console.info(JSON.stringify(openAIResponse.data));

      openAIResponse.data.choices.forEach(choice => {
        const { message: choiceMessage } = choice;
        if (!choiceMessage) return;

        const splitMessage = choiceMessage.content.match(/(.|[\r\n]){1,1500}/g);
        splitMessage?.map(chunk => message.channel.send(chunk));
      });
    } catch (e) {
      console.error(e);
    }
  }
};
