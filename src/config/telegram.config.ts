import { Telegram } from '../telegram/telegram.interface';

export const getTelegramConfig = (): Telegram => ({
	chatId: process.env.BOT_CHAT_ID!,
	token: process.env.BOT_TOKEN!,
})