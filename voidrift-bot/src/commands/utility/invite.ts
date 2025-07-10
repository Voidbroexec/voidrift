import { Command, CommandExecuteOptions } from '../../types/command';
import { config } from '../../config';
const invite: Command = {
  options: {
    name: 'invite',
    description: 'Get the bot\'s invite link.',
    category: 'utility',
    usage: '/invite'
  },
  execute: async ({ message, client }: CommandExecuteOptions) => {
    if (!message || !client) return;
    const id = client.user?.id;
    if (!id) {
      await message.reply('Could not get bot ID.');
      return;
    }
    const link = `https://discord.com/oauth2/authorize?client_id=${id}&permissions=8&scope=bot`;
    await message.reply(`Invite me to your server: ${link}`);
  }
};
export default invite; 