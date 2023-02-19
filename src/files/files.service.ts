import { BotService } from "../bot/bot.service";
import { unlink } from 'node:fs';
import { FileRepository } from "./model/files.repository";
import mongoose from "mongoose";
import { isValidObjectId } from "../utils/isObjectId";
import { HttpError } from "../utils/Error";
import { IFile } from "./model/files.interface";
import { IFileRepository } from "./model/files.repository-interface";
import { AuthService } from "../auth/auth.service";
import { UserService } from "../users/users.service";
import { IUser } from "../users/model/users.interface";
import { TelegramAudioDocument, TelegramDocument } from "../bot/types/telegram-file.type";
import { FileOptions } from "./types/file-options.type";
import DataEncode from "../utils/file-encryption/encrypt";


class FileService {
  private fileRepo: IFileRepository<IFile>
  constructor(
    private botService = new BotService(),
    private readonly authService = new AuthService(),
    private readonly userService = new UserService()
    ) {
      this.fileRepo = new FileRepository()
    }

  async getAll(sort: string, token: string, parent: string) {
    const user = await this.getUser(token);
    
    if (parent) {
      const isValidId = isValidObjectId(parent);

      if (!isValidId) throw new HttpError('parent id is not valid', 400);
    } 
   
    const files = await this.fileRepo.getAll({parent: parent, userId: user._id}, sort);

    if (!files) throw new HttpError('Can not get files', 500);

    await this.checkLinkExp(files);

    return files;
  }

  async getLink(id: string) {
    const link = await this.botService.getLink(id);
    return link;
  }
  
  async getFile(id: string, token: string) {
    const user = await this.getUser(token);
    const isValidId = isValidObjectId(id);
    
    if (!isValidId) throw new HttpError('file id is not valid', 400);
  
    const file = await this.fileRepo.getOne({_id: id}, user._id!);
   
    if (!file) throw new HttpError('Can not get file', 500);
    
    if (file.type === 'directory') throw new HttpError('can not get folder', 400);

    await this.checkLinkExp([file]);

    return {
      name: file.name,
      link: file.link,
      secret: user.email
    };
  }

  async create(reqFile: any, token: string, parent?: string) {
    const user = await this.getUser(token);
    const path = reqFile.path;
    const fileOptions = {
      filename: reqFile.name,
      type: reqFile.type,
      secret: user.email,
    } as FileOptions;
    let fileId: string;
    let savedFile: TelegramDocument | TelegramAudioDocument;

    if (fileOptions.type.split('/')[0] === 'audio') {
      savedFile = await this.saveFile(path, fileOptions) as TelegramAudioDocument;
      fileId = savedFile.audio.file_id;  
    } else {
      savedFile = await this.saveFile(path, fileOptions) as TelegramDocument;
      fileId = savedFile.document.file_id;
    }
    
    this.deleteFromDisk(path);
    const fileLink = await this.botService.getLink(fileId);
    const fileType = reqFile?.name?.split('.').pop();
   
    if (!parent) {
      const file = await this.fileRepo.create({
        name: reqFile.name,
        storageId: fileId,
        link: fileLink,
        size: reqFile.size,
        type: fileType,
        childs: [],
        parent: null,
        userId: user._id
      })
    
      return file;
    }

    const isValidId = isValidObjectId(parent);

    if (!isValidId) throw new HttpError('parent id is not valid', 400);
   
    const fileParent = await this.fileRepo.getOne({_id: parent}, user._id!);

    if (!fileParent || fileParent.type !== 'directory') throw new HttpError('directory not exist', 404) 
   
    const file = await this.fileRepo.create({
      name: reqFile.name,
      storageId: fileId!,
      link: fileLink,
      size: reqFile.size,
      type: fileType!,
      childs: [],
      parent: fileParent?._id,
      userId: user._id
    })
  
    fileParent?.childs?.push(file._id);
    await fileParent?.save?.();

    return file;
  }

  async createDirectory(name: string, token: string, parent?: string) {
    const type = 'directory';
    const user = await this.getUser(token);
  
    if (!parent) {
      const directory = await this.fileRepo.create({name, type, parent: null, userId: user._id});
      return directory;
    }
    
    const isValidId = isValidObjectId(parent);

    if (!isValidId) throw new HttpError('parent id is not valid', 400);

    const parentId = new mongoose.Types.ObjectId(parent); 
   
    const parentDirectory = await this.fileRepo.getOne({_id: parentId}, user._id!);
    
    if (!parentDirectory) throw new HttpError('parent directory not exist', 404);
    
    const directory = await this.fileRepo.create({name, type, parent: parentId, userId: user._id});

    parentDirectory?.childs?.push(directory._id);
    await parentDirectory.save?.();
    
    return directory;
  }


  async delete(id: string, token: string) {
    const user = await this.getUser(token);
    const isValidId = isValidObjectId(id);

    if (!isValidId) throw new HttpError('file id is not valid', 400);
   
    const file = await this.fileRepo.getOne({_id: id}, user._id!);
    
    if (!file) throw new HttpError('file not exist', 404);

    file?.childs?.length ?  Promise.all([this.deleteChilds(file, user), this.deleteParent(file, user)]) :  await this.deleteParent(file, user);
    
    const deletedFile = await this.fileRepo.delete({_id: id, userId: user._id});
  
    return deletedFile;
  }
 
  private async deleteChilds(file: IFile, user: IUser) {
    file.childs?.forEach(async file => {
      const isParent = await this.fileRepo.getOne({_id: file}, user._id!)

      if (isParent?.childs?.length) await this.deleteChilds(isParent, user);

      await this.fileRepo.delete({_id: file});
    })
  }

  private async deleteParent(file: IFile, user: IUser) {
    await this.fileRepo.deleteParent({_id: file.parent, userId: user._id!}, { $pull: { 'childs': file._id } });
  }

  private async checkLinkExp(files: IFile[]) {
    const oneHour = 3600000;
  
    files.forEach(async file => {
      if (file.type !== 'directory' && (Number(file.updatedAt) + oneHour) <= Date.now()) {
        const newLink = await this.getLink(file.storageId!);
        file.link = newLink;
        file.updatedAt = new Date(Date.now());
        await file.save?.();
      }
    })
  }

  private async saveFile(path: string, fileOptions: FileOptions) {
    const encryptedFilePath = await DataEncode.encrypt(path, fileOptions.secret);
    const file = await this.botService.sendDocs(encryptedFilePath, fileOptions);

    if (!file) throw new HttpError('internal server error', 500);

    this.deleteFromDisk(encryptedFilePath);

    if (fileOptions.type.split('/')[0] === 'audio') return file as TelegramAudioDocument;

    return file as TelegramDocument;
  }

  private deleteFromDisk(path: string) {
    unlink(path, (err) => {
      if (err) throw err;
    });
  }

  private async getUser(token: string) {
    const email = this.authService.getPayloadFromRawToken(token);
    
    const candidate = await this.userService.checkEmail(email);

    if (!candidate) throw new HttpError('user not found', 404);

    return candidate;
  }
}


export default FileService;