import TelegramBot from 'node-telegram-bot-api';
import {token} from './constant';


export class BotService {

  constructor(private readonly bot = new TelegramBot(token, {polling: true})) {}
 

  greet() {
    this.bot.on('message', (msg: TelegramBot.Message) => {

    if (msg.text) {
      this.bot.sendMessage(msg.chat.id, msg.text);
    }

    })
  }
}