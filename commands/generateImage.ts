import { Command } from './command';
import { SlashCommandBuilder, userMention } from '@discordjs/builders';
import { openai } from '../utils/openAIConfig';

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

    await interaction.reply({
      content: 'Generating image...',
      ephemeral: true
    });
    const description = interaction.options.getString('description', true);
    try {
      const openAIResponse = await openai.createImage({
        prompt: description
      });

      const url = openAIResponse.data.data[0].url;
      if (!url) return;
      await interaction.channel?.send({
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
    } catch (e) {
      console.log(e);
    }
  }
};
