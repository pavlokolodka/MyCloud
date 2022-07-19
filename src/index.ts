import 'dotenv/config'
import FileController from './files/files.controller';
import Server from './configuration/server';

const port = Number(process.env.PORT) || 3000;


const app = new Server(
  [
    new FileController()
  ],
  port
);

app.listen();
