import { BotService } from '../bot/bot.service';
import { UserRepository } from '../users/model/users.repository';
import { UserService } from '../users/users.service';
import FileController from './files.controller';
import FileService from './files.service';
import { FileRepository } from './model/files.repository';

const FileModule = new Map();
const fileServices = new Map();
fileServices.set(FileService, [FileRepository, BotService]);
fileServices.set(UserService, [UserRepository]);
FileModule.set(FileController, [fileServices]);

export default FileModule;
