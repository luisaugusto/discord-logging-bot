import type { Event } from './event';

export const messageCreate: Event<'messageCreate'> = {
  name: 'messageCreate',
  async execute(message) {
    const text = message.content.toLowerCase();

    if (Math.random() > 0.5) return;
    if (!text.includes('GAS PEDAL') || message.author.bot) return;
    const exclamationCount = Math.floor(Math.random() * 10) + 3;
    const exclamations = Array.from(Array(exclamationCount))
      .map(() => (Math.random() > 0.8 ? '1' : '!'))
      .join('');
    message.channel.send('GAS PEDAL' + exclamations);
  }
};
