import { Command, createMessageApplication } from "./command";
import { channelMention, userMention } from "@discordjs/builders";
import { Message } from "discord.js";
import { getLoggingChannel } from "../utils/getLoggingChannel";
import { createMessage } from "../utils/createMessage";
import { logtail } from "../utils/logtailConfig";

export const report: Command = {
  data: createMessageApplication("Report Message"),
  async execute(interaction) {
    if (!interaction.guild) return;
    if (!interaction.isContextMenuCommand()) return;

    await interaction.reply({
      content:
        "Hi there! I heard you wanted to report a message. I'll send you a DM to collect a little more information.",
      ephemeral: true,
    });
    await interaction.user.send(
      `Hello, ${userMention(
        interaction.user.id,
      )}! You recently asked to report a message in ${channelMention(
        interaction.channelId,
      )} on the ${
        interaction.guild.name
      } server. Could you tell me a little more about why you reported this?`,
    );

    const listener = (message: Message) => {
      (async () => {
        if (!interaction.guild) return;
        if (message.author.id !== interaction.user.id) return;
        const channel = await getLoggingChannel(
          interaction.guild.channels,
          process.env.REPORTS_CHANNEL,
        );

        await interaction.user.send(
          `Thanks for letting me know! I'll forward this information over the to admins in the server for them to review and take the appropriate action.`,
        );

        const reportedMessage = await interaction.channel?.messages.fetch(
          interaction.targetId,
        );

        if (!reportedMessage) return;

        await channel.send(
          createMessage(
            reportedMessage,
            `:rotating_light: ${String(
              interaction.guild.roles.everyone,
            )} A message has been reported by ${userMention(
              interaction.user.id,
            )} in ${channelMention(interaction.channelId)}\n${
              reportedMessage.url
            }`,
            [{ name: "Reason for Reporting:", value: message.content }],
          ),
        );

        interaction.client.removeListener("messageCreate", listener);
      })().catch(async (err) =>
        logtail.error(
          "Error in report command",
          JSON.parse(JSON.stringify(err)),
        ),
      );
    };

    interaction.client.on("messageCreate", listener);
  },
};
