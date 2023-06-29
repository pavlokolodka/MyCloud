import TelegramBot from 'node-telegram-bot-api';
import { token } from './constants';
import { chatID } from './constants';

export class BotService {
  constructor(private readonly bot = new TelegramBot(token)) {}

  greet() {
    this.bot.on('message', (msg: TelegramBot.Message) => {
      if (msg.text) {
        this.bot.sendMessage(msg.chat.id, msg.text);
      }
    });
  }

  sendPhoto(file: any) {
    const res = this.bot.sendPhoto(chatID, file);

    return res;
  }

  sendDocs(file: any) {
    const res = this.bot.sendDocument(chatID, file);

    return res;
  }

  sendAudio(file: any) {
    const res = this.bot.sendAudio(chatID, file);

    return res;
  }

  sendVideo(file: any) {
    const res = this.bot.sendVideo(chatID, file);

    return res;
  }

  getLink(id: string) {
    const file = this.bot.getFileLink(id);

    return file;
  }
}
