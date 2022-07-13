import express, { Express, Request, Response } from 'express';
import 'dotenv/config'
import {BotService} from './bot/bot.service';


const app: Express = express();
const port = process.env.PORT || 3000;


             
const bot = new BotService();
bot.greet()


app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});