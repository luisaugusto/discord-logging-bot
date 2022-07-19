import type { Event } from './event';
import { getLoggingChannel } from '../utils/getLoggingChannel';
import { createMessage } from '../utils/createMessage';
import { AuditLogEvent, ChannelType } from 'discord.js';

export const messageDelete: Event<'messageDelete'> = {
  name: 'messageDelete',
  async execute(message) {
    if (!message.guild || message.channel.type === ChannelType.DM) return;

    const fetchedLogs = await message.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MessageDelete
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
      await channel.send(
        createMessage(
          fullMessage,
          `<@${auditLog.executor.id}> has deleted a message in <#${message.channelId}> :eyes:`
        )
      );
    } else if (fullMessage) {
      // If there is no audit log, we cannot find out who deleted the message, but we can still show the message content
      await channel.send(
        createMessage(
          fullMessage,
          `A message was deleted in <#${message.channelId}>, but no relevant audit logs were found and I'm not sure who deleted it.`
        )
      );
    } else {
      // If there's no audit log, and we just have a partial message, the only data we can really get is the channel id.
      await channel.send(
        `A message was deleted in <#${message.channelId}>, but I could not find any other details about this action. Sorry!\nMessage ID: ${message.id}`
      );
    }
  }
};
