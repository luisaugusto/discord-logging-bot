import { Command } from './command';
import { SlashCommandBuilder, userMention } from '@discordjs/builders';
import { openai } from '../utils/openAIConfig';
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL
} from 'firebase/storage';
import { app } from '../utils/firebaseConfig';

const storage = getStorage(app);
let canGenerateImage = true;

export const generateImage: Command = {
  data: new SlashCommandBuilder()
    .setName('generate-image')
    .setDescription('Generate an image using ChatGPT')
    .addStringOption(option =>
      option
        .setName('description')
        .setDescription('Description of the image')
        .setRequired(true)
    ),
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;
    if (!canGenerateImage) {
      await interaction.reply({
        content: 'Please wait up to 1 minute before generating another image.',
        ephemeral: true
      });
      return;
    }

    await interaction.reply({
      content: 'Generating image...',
      ephemeral: true
    });
    const description = interaction.options.getString('description', true);
    try {
      const openAIResponse = await openai.createImage({
        prompt: description,
        size: '512x512',
        response_format: 'b64_json'
      });

      canGenerateImage = false;
      setTimeout(() => {
        canGenerateImage = true;
      }, 60000);

      const createdAt = openAIResponse.data.created;
      const url = openAIResponse.data.data[0].b64_json;
      if (!url) return;

      const imageRef = ref(storage, `${createdAt}.jpg`);

      uploadString(imageRef, url, 'base64').then(async snapshot => {
        const url = await getDownloadURL(snapshot.ref);

        interaction.channel?.send({
          embeds: [
            {
              image: {
                url
              },
              fields: [
                {
                  name: 'Description',
                  value: description
                },
                {
                  name: 'Author',
                  value: userMention(interaction.user.id)
                }
              ]
            }
          ]
        });
      });
    } catch (e) {
      console.log(e);
    }
  }
};
