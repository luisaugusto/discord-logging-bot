import type { Event } from "./event";
import { getLoggingChannel } from "../utils/getLoggingChannel";
import { createMessage } from "../utils/createMessage";
import { AuditLogEvent, channelMention, ChannelType } from "discord.js";
import { logtail } from "../utils/logtailConfig";

export const messageDelete: Event<"messageDelete"> = {
  name: "messageDelete",
  async execute(message) {
    if (!message.guild || message.channel.type === ChannelType.DM) return;

    const fetchedLogs = await message.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MessageDelete,
    });
    const auditLog = fetchedLogs.entries.first();

    const channel = await getLoggingChannel(message.guild.channels);
    if (!channel) return;

    const fullMessage = await message.fetch().catch(async (err) => {
      await logtail.info("Error fetching message", {
        error: String(err),
      });
    });

    const messageAuthorId = message.author?.id;
    const hasMatchingAudit = auditLog?.target?.id === messageAuthorId;
    const isSelfDelete = auditLog?.executor?.id === messageAuthorId;

    if (
      (hasMatchingAudit || isSelfDelete) &&
      auditLog?.executor &&
      fullMessage
    ) {
      await channel.send(
        createMessage(
          fullMessage,
          `<@${auditLog.executor.id}> has deleted a message in <#${message.channelId}> :eyes:`,
        ),
      );
    } else {
      // If there's no audit log, and we just have a partial message, the only data we can really get is the channel id.
      await channel.send(
        `A message was deleted in ${channelMention(
          message.channelId,
        )}, but I could not find any other details about this action. Sorry!\nMessage ID: ${
          message.id
        }`,
      );
    }
  },
};
