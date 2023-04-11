import 'dotenv/config';
import FileController from './files/files.controller';
import Server from './configuration/server';
import { AuthController } from './auth/auth.controller';

const port = Number(process.env.PORT) || 3000;

const app = new Server([new FileController(), new AuthController()], port);

app.listen();
