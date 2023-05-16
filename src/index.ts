import 'dotenv/config';
import Server from './configuration/server';
import ControllerFactory from './utils/controller.factory';
import FileModule from './files/files.module';
import AuthModule from './auth/auth.module';

const port = Number(process.env.PORT) || 5000;
const authController = ControllerFactory.createController(AuthModule);
const fileController = ControllerFactory.createController(FileModule);
const app = new Server([...fileController, ...authController], port);
// new comment
app.listen();
