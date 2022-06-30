import type { Event } from './event';

export const messageCreate: Event<'messageCreate'> = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot) return;
    const text = message.content.toLowerCase();

    if (
      new Date().getTime() < new Date('July 4, 2022').getTime() &&
      new Date().getTime() >= new Date('July 1, 2022').getTime()
    ) {
      const emojis = message.guild?.emojis.cache.filter(
        emoji => emoji.name?.toLowerCase().includes('goose') || false
      );
      const randomEmoji = emojis?.random();

      if (!randomEmoji) return;
      await message.react(randomEmoji);
    }

    if (Math.random() > 0.5) return;
    if (!text.includes('gas pedal')) return;
    const exclamationCount = Math.floor(Math.random() * 10) + 3;
    const exclamations = Array.from(Array(exclamationCount))
      .map(() => (Math.random() > 0.8 ? '1' : '!'))
      .join('');
    message.channel.send('GAS PEDAL' + exclamations);
  }
};
