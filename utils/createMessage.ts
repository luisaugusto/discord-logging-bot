import { Message, MessageCreateOptions, MessagePayload } from "discord.js";

interface Field {
  name: string;
  value: string;
  inline?: boolean;
}

export const createMessage = (
  messageData: Message,
  content?: string,
  fields: Field[] = [],
): MessagePayload | MessageCreateOptions => ({
  content,
  embeds: [
    {
      description: `${messageData.content}\n\n- <@${messageData.author.id}>`,
      timestamp: messageData.createdAt.toISOString(),
      thumbnail: {
        url: messageData.author.avatarURL() || "",
      },
      image: {
        url: messageData.attachments.first()?.url || "",
      },
      fields,
    },
  ],
});
