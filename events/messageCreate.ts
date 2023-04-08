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
      const openAIResponse = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are an AI assistant on a discord server with light-hearted and comedic personality'
          },
          ...mappedMessages
        ]
      });

      openAIResponse.data.choices.forEach(choice => {
        const { message: choiceMessage } = choice;
        if (!choiceMessage) return;
        message.channel.send(choiceMessage.content);
      });
    } catch (e) {
      console.log(e);
    }
  }
};
