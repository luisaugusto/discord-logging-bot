import type { Event } from './event';
import axios from 'axios';

export const messageCreate: Event<'messageCreate'> = {
  name: 'messageCreate',
  async execute(message) {
    if (Math.random() > 0.5) return;
    const text = message.content.toLowerCase();
    // April Fool's Weekend
    if (new Date().getTime() < new Date('April 4, 2022').getTime()) {
      if (!text.includes('goose') || message.author.bot) return;

      const gif = await axios.get<{ data: { id: string } }>(
        'https://api.giphy.com/v1/gifs/random',
        {
          params: {
            api_key: process.env.GIPHY_KEY,
            tag: 'geese'
          }
        }
      );

      message.channel.send({
        embeds: [
          {
            image: {
              url: `https://media0.giphy.com/media/${gif.data.data.id}/giphy.gif`
            }
          }
        ]
      });
    }

    if (!text.includes('GAS PEDAL') || message.author.bot) return;
    const exclamationCount = Math.floor(Math.random() * 10) + 3;
    const exclamations = Array.from(Array(exclamationCount))
      .map(() => (Math.random() > 0.8 ? '1' : '!'))
      .join('');
    message.channel.send('GAS PEDAL' + exclamations);
  }
};
