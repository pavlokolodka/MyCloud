import { BotService } from '../bot/bot.service';
import { UserRepository } from '../users/model/users.repository';
import { UserService } from '../users/users.service';
import FileController from './files.controller';
import FileRouter from './files.router';
import FileService from './files.service';
import { FileRepository } from './model/files.repository';

const FileModule = new Map();
const fileServices = new Map();
const fileController = new Map();
fileServices.set(FileService, [FileRepository, BotService]);
fileServices.set(UserService, [UserRepository]);
fileController.set(FileController, [fileServices]);
FileModule.set(FileRouter, [fileController]);

export default FileModule;
