import { Command, CommandExecuteOptions } from '../../types/command';
import { InferenceClient } from '@huggingface/inference';

// Accept token as string | undefined and handle undefined
async function askDeepSeekV3(prompt: string, token: string | undefined): Promise<string> {
  if (!token) return '❌ DeepSeek-V3 error: Hugging Face API token not set.';
  try {
    const client = new InferenceClient(token!);
    const chatCompletion = await client.chatCompletion({
      provider: 'fireworks-ai',
      model: 'deepseek-ai/DeepSeek-V3',
      messages: [
        { role: 'user', content: prompt }
      ]
    });
    return chatCompletion.choices[0]?.message?.content ?? 'No response.';
  } catch (err: any) {
    return '❌ DeepSeek-V3 error: ' + (err?.message || err);
  }
}

const ai: Command = {
  options: {
    name: 'ai',
    description: 'Chat with DeepSeek-V3 (Hugging Face)',
    category: 'fun',
    usage: '/ai <your prompt>',
  },
  execute: async ({ message, args }: CommandExecuteOptions) => {
    if (!message) return;
    const HF_TOKEN = process.env.HUGGINGFACE_TOKEN;
    if (!HF_TOKEN) {
      await message.reply('Hugging Face API token not set.');
      return;
    }
    if (!args || args.length === 0) {
      await message.reply('Usage: /ai <your prompt>');
      return;
    }
    const prompt = args.join(' ');
    const output = await askDeepSeekV3(prompt, HF_TOKEN);
    let reply = output || 'No response.';
    if (reply.length > 1900) reply = reply.slice(0, 1900) + '...';
    await message.reply(reply);
  }
};
export default ai;