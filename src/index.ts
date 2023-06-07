import 'dotenv/config';
import Server from './configuration/server';
import ModuleFactory from './utils/controller.factory';
import FileModule from './files/files.module';
import AuthModule from './auth/auth.module';

const port = Number(process.env.PORT) || 5000;
const authComponent = ModuleFactory.createModule(AuthModule);
const fileComponent = ModuleFactory.createModule(FileModule);
const app = new Server([...fileComponent, ...authComponent], port);

app.listen();
