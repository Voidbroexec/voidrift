import { Command, CommandExecuteOptions } from '../../types/command';
const suggest: Command = {
  options: {
    name: 'suggest',
    description: 'Submit a suggestion to the server admins.',
    category: 'community',
    usage: '/suggest <suggestion>'
  },
  execute: async ({ message, args }: CommandExecuteOptions) => {
    if (!message || !args) return;
    const suggestion = args.join(' ');
    const channel = message.guild?.channels.cache.find((ch: any) => ch.isTextBased && ch.isTextBased() && ch.name === 'suggestions');
    if (!channel) {
      await message.reply('Suggestions channel not found.');
      return;
    }
    await (channel as any).send(`💡 **Suggestion from <@${message.author.id}>:**\n${suggestion}`);
    await message.reply('Your suggestion has been submitted!');
  }
};
export default suggest; 