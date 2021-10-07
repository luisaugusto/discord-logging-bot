import { Message, MessageOptions, MessagePayload } from 'discord.js';

interface Field {
  name: string;
  value: string;
  inline?: boolean;
}

export const createMessage = (
  messageData: Message,
  content?: string,
  fields: Field[] = []
): MessagePayload | MessageOptions => ({
  content,
  embeds: [
    {
      description: `${messageData.content}\n\n- <@${messageData.author.id}>`,
      timestamp: messageData.createdAt,
      thumbnail: {
        url: messageData.author.avatarURL() || ''
      },
      image: {
        url: messageData.attachments.first()?.url
      },
      fields
    }
  ]
});
