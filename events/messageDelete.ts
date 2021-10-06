import type { Event } from './event';
import { getLoggingChannel } from '../utils/getLoggingChannel';
import { Message, MessageOptions, MessagePayload } from 'discord.js';

export const messageDelete: Event<'messageDelete'> = {
  name: 'messageDelete',
  async execute(message) {
    if (!message.guild || message.channel.type === 'DM') return;

    const fetchedLogs = await message.guild.fetchAuditLogs({
      limit: 1,
      type: 'MESSAGE_DELETE'
    });
    const auditLog = fetchedLogs.entries.first();

    const channel = await getLoggingChannel(message.guild.channels);
    if (!channel) return;

    const fullMessage = await (() => {
      if (!message.partial) return message;
      return message
        .fetch()
        .then(message => message)
        .catch(() => null);
    })();

    const createMessage = (
      messageData: Message,
      content?: string
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
          }
        }
      ]
    });

    const hasMatchingAudit =
      auditLog?.target &&
      'id' in auditLog.target &&
      auditLog.target.id === message.author?.id;
    const isSelfDelete = auditLog?.executor?.id === message.author?.id;

    if (
      (hasMatchingAudit || isSelfDelete) &&
      auditLog?.executor &&
      fullMessage
    ) {
      channel.send(
        createMessage(
          fullMessage,
          `<@${auditLog.executor.id}> has deleted a message in <#${message.channelId}> :eyes:`
        )
      );
    } else if (fullMessage) {
      // If there is no audit log, we cannot find out who deleted the message, but we can still show the message content
      channel.send(
        createMessage(
          fullMessage,
          `A message was deleted in <#${message.channelId}>, but no relevant audit logs were found and I'm not sure who deleted it.`
        )
      );
    } else {
      // If there's no audit log and we just have a partial message, the only data we can really get is the channel id.
      channel.send(
        `A message was deleted in <#${message.channelId}>, but I could not find any other details about this action. Sorry!\nMessage ID: ${message.id}`
      );
    }
  }
};
