import { Command, CommandExecuteOptions } from '../../types/command';
const remindme: Command = {
  options: {
    name: 'remindme',
    description: 'Set a reminder for yourself.',
    category: 'utility',
    usage: '/remindme <minutes> <reminder>',
  },
  execute: async ({ message, args, client }: CommandExecuteOptions) => {
    if (!message) return;
    const [minutes, ...reminderArr] = args || [];
    const mins = parseInt(minutes, 10);
    if (isNaN(mins) || mins <= 0 || reminderArr.length === 0) {
      await message.reply('Usage: /remindme <minutes> <reminder>');
      return;
    }
    const reminder = reminderArr.join(' ');
    await message.reply(`I will remind you in ${mins} minute(s): ${reminder}`);
    setTimeout(() => {
      message.reply(`⏰ Reminder: ${reminder}`);
    }, mins * 60 * 1000);
  }
};
export default remindme; 