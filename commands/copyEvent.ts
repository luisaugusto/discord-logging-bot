import { Command } from "./command";
import { SlashCommandBuilder } from "@discordjs/builders";
import { logtail } from "../utils/logtailConfig";

export const copyEvent: Command = {
  data: new SlashCommandBuilder()
    .setName("copy-event")
    .setDescription("Creates a duplicate of an event with the event ID")
    .addStringOption((option) =>
      option
        .setName("event-id")
        .setDescription("The ID of the event you want to copy")
        .setRequired(true)
    ),
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;
    const eventId = interaction.options.getString("event-id", true);
    const events = await interaction.guild?.scheduledEvents.fetch();
    const event = events?.find((e) => e.id === eventId);

    if (!event) {
      await interaction.reply({
        content: "Could not find an event with that ID",
        ephemeral: true,
      });
      return;
    }

    if (!event.scheduledStartAt) {
      await interaction.reply({
        content: "Event requires a scheduled start time.",
        ephemeral: true,
      });
      return;
    }

    try {
      await interaction.guild?.scheduledEvents.create({
        name: event.name,
        privacyLevel: event.privacyLevel,
        entityType: event.entityType,
        channel: event.channel ?? undefined,
        image: event.coverImageURL(),
        scheduledEndTime: event.scheduledEndAt ?? undefined,
        scheduledStartTime: event.scheduledStartAt,
        description: event.description ?? "",
        entityMetadata: {
          location: "",
        },
      });

      await interaction.reply({
        content: "The event has been copied!",
        ephemeral: true,
      });
    } catch (e) {
      const channel = interaction.channel;
      if (channel?.isSendable()) {
        await interaction.reply({
          content: "Sorry! There was an error copying the event.",
          ephemeral: true,
        });
      }

      await logtail.error(
        "Error generating image",
        JSON.parse(JSON.stringify(e))
      );
    }
  },
};
