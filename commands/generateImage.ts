import { Command } from "./command";
import { SlashCommandBuilder, userMention } from "@discordjs/builders";
import { openai } from "../utils/openAIConfig";
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
} from "firebase/storage";
import { app } from "../utils/firebaseConfig";
import { logtail } from "../utils/logtailConfig";

const storage = getStorage(app);
let canGenerateImage = true;

export const generateImage: Command = {
  data: new SlashCommandBuilder()
    .setName("generate-image")
    .setDescription("Generate an image using ChatGPT")
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("Description of the image")
        .setRequired(true),
    ),
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;
    if (!canGenerateImage) {
      await logtail.warn("User tried to generate image too soon", {
        user: interaction.user.username,
      });
      await interaction.reply({
        content: "Please wait up to 1 minute before generating another image.",
        ephemeral: true,
      });
      return;
    }

    await interaction.reply({
      content: "Generating image...",
      ephemeral: true,
    });
    const description = interaction.options.getString("description", true);
    try {
      const openAIResponse = await openai.images.generate({
        prompt: description,
        size: "512x512",
        response_format: "b64_json",
      });
      await logtail.info(
        "Image generated",
        JSON.parse(JSON.stringify(openAIResponse.data)),
      );

      canGenerateImage = false;
      setTimeout(() => {
        canGenerateImage = true;
      }, 60000);

      const createdAt = openAIResponse.created;
      const b64Json = openAIResponse.data[0].b64_json;
      if (!b64Json) return;

      const imageRef = ref(storage, `${createdAt}.jpg`);
      const snapshot = await uploadString(imageRef, b64Json, "base64");
      const url = await getDownloadURL(snapshot.ref);
      await logtail.info("Image uploaded to Firebase", { url });

      await interaction.channel?.send({
        embeds: [
          {
            image: {
              url,
            },
            fields: [
              {
                name: "Description",
                value: description,
              },
              {
                name: "Author",
                value: userMention(interaction.user.id),
              },
            ],
          },
        ],
      });
    } catch (e) {
      await interaction.channel?.send({
        content: "Sorry! There was an error generating an image.",
        embeds: [
          {
            fields: [
              {
                name: "Description",
                value: description,
              },
              {
                name: "Author",
                value: userMention(interaction.user.id),
              },
            ],
          },
        ],
      });
      await logtail.error(
        "Error generating image",
        JSON.parse(JSON.stringify(e)),
      );
    }
  },
};
