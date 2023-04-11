import TelegramBot from 'node-telegram-bot-api';
import { HttpError } from '../utils/Error';
import { token } from './constants';
import { chatID } from './constants';
import { FileOptions } from '../files/types/file-options.type';

export class BotService {
  constructor(
    private readonly bot = new TelegramBot(token, { polling: true }),
  ) {}

  greet() {
    this.bot.on('message', (msg: TelegramBot.Message) => {
      if (msg.text) {
        this.bot.sendMessage(msg.chat.id, msg.text);
      }
    });
  }

  sendPhoto(file: any) {
    const res = this.bot.sendPhoto(chatID, file).catch((e) => {
      throw new HttpError('internal server error', 500);
    });
    return res;
  }

  sendDocs(file: any, fileOptions: FileOptions) {
    const res = this.bot
      .sendDocument(chatID, file, {}, fileOptions)
      .catch((e) => {
        throw new HttpError('internal server error', 500);
      });

    return res;
  }

  sendAudio(file: any) {
    const res = this.bot.sendAudio(chatID, file).catch((e) => {
      throw new HttpError('internal server error', 500);
    });

    return res;
  }

  sendVideo(file: any) {
    const res = this.bot.sendVideo(chatID, file).catch((e) => {
      throw new HttpError('internal server error', 500);
    });

    return res;
  }

  getLink(id: string) {
    const file = this.bot.getFileLink(id).catch((e) => {
      throw new HttpError('internal server error', 500);
    });

    return file;
  }
}
