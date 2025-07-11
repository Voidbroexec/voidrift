import { ChatInputCommandInteraction, Collection, GuildMember, Message, TextBasedChannel, User, MessagePayload, MessageReplyOptions } from 'discord.js';

export function interactionToMessage(interaction: ChatInputCommandInteraction, content: string): Message {
  const fake: Partial<Message> = {
    id: interaction.id,
    content,
    author: interaction.user,
    client: interaction.client,
    channel: interaction.channel as any,
    guild: interaction.guild || null,
    member: interaction.member as GuildMember | null,
    createdTimestamp: interaction.createdTimestamp,
    mentions: {
      users: new Collection<string, User>(),
      members: new Collection<string, GuildMember>(),
      channels: new Collection(),
      roles: new Collection(),
      crosspostedChannels: new Collection(),
      everyone: false,
      repliedUser: null,
    } as any,
    reply: async (options: string | MessagePayload | MessageReplyOptions) => {
      if (interaction.replied || interaction.deferred) {
        return interaction.followUp(options);
      }
      return interaction.reply(options);
    }
  };
  return fake as Message;
}
