import { unlink } from 'node:fs';
import { Types } from 'mongoose';
import { BotService } from '../bot/bot.service';
import { isValidObjectId } from '../utils/isObjectId';
import { HttpError } from '../utils/Error';
import { IFile } from './model/files.interface';
import { IFileRepository } from './model/files.repository-interface';
import {
  TelegramAudioDocument,
  TelegramDocument,
} from '../bot/types/telegram-file.type';
import { FileOptions } from './types/file-options.type';
import DataEncode from '../utils/file-encryption/encrypt';
import { Sort } from './types/files.sort';

class FileService {
  private fileRepository: IFileRepository<IFile>;
  private botService: BotService;

  constructor(fileRepo: IFileRepository<IFile>, botService: BotService) {
    this.fileRepository = fileRepo;
    this.botService = botService;
  }

  async getAll(userId: Types.ObjectId, parent?: string, sort?: Sort) {
    if (parent) {
      const parentDirectory = await this.getParentFile(parent, userId);
    }

    const files = await this.fileRepository.getAll(
      { parent: parent, userId: userId },
      sort,
    );

    await this.checkLinkExp(files);

    return files;
  }

  async getOne(id: string, userId: Types.ObjectId) {
    const isValidId = isValidObjectId(id);

    if (!isValidId) throw new HttpError('File id is not valid', 400);

    const file = await this.fileRepository.getOne(new Types.ObjectId(id));

    if (!file) throw new HttpError('File not found', 404);

    if (String(file.userId) !== String(userId)) {
      throw new HttpError('User not have permission to access this file', 403);
    }

    return file;
  }

  async download(id: string, userId: Types.ObjectId) {
    const file = await this.getOne(id, userId);

    if (file.type === 'directory')
      throw new HttpError('Can not get folder', 400);

    await this.checkLinkExp([file]);

    return {
      name: file.name,
      link: file.link,
      secret: String(userId),
    };
  }

  async create(reqFile: any, userId: Types.ObjectId, parent?: string) {
    const path = reqFile.path;
    const fileOptions = {
      filename: reqFile.name,
      type: reqFile.type,
      secret: String(userId),
    } as FileOptions;
    let fileId: string;
    let savedFile: TelegramDocument | TelegramAudioDocument;

    if (fileOptions.type.split('/')[0] === 'audio') {
      savedFile = (await this.saveFile(
        path,
        fileOptions,
      )) as TelegramAudioDocument;
      fileId = savedFile.audio.file_id;
    } else {
      savedFile = (await this.saveFile(path, fileOptions)) as TelegramDocument;
      fileId = savedFile.document.file_id;
    }

    this.deleteFromDisk(path);
    const fileLink = await this.botService.getLink(fileId);
    const fileType = reqFile?.name?.split('.').pop();

    if (!parent) {
      const file = await this.fileRepository.create({
        name: reqFile.name,
        storageId: fileId,
        link: fileLink,
        size: reqFile.size,
        type: fileType,
        childs: null,
        parent: null,
        userId: userId,
      });

      return file;
    }

    const fileParent = await this.getParentFile(parent, userId);

    const file = await this.fileRepository.create({
      name: reqFile.name,
      storageId: fileId!,
      link: fileLink,
      size: reqFile.size,
      type: fileType!,
      childs: null,
      parent: fileParent._id,
      userId: userId,
    });

    await this.fileRepository.addChilds(fileParent._id, [file._id]);

    return file;
  }

  async createDirectory(name: string, userId: Types.ObjectId, parent?: string) {
    const type = 'directory';

    if (!parent) {
      const directory = await this.fileRepository.create({
        name,
        type,
        parent: null,
        userId: userId,
        size: 0,
        childs: [],
      });
      return directory;
    }

    const parentDirectory = await this.getParentFile(parent, userId);

    const directory = await this.fileRepository.create({
      name,
      type,
      parent: parentDirectory._id,
      userId: userId,
      size: 0,
      childs: [],
    });

    await this.fileRepository.addChilds(parentDirectory._id, [directory._id]);

    return directory;
  }

  async update(
    fileId: string,
    userId: Types.ObjectId,
    name?: string,
    parentId?: string,
  ) {
    const file = await this.getOne(fileId, userId);

    if (name && parentId) {
      const newParentDirectory = await this.getParentFile(parentId, userId);

      // delete all the files from old parent directory
      if (file.parent) {
        const parentDirectory = await this.getParentFile(
          String(file.parent),
          userId,
        );
        let index = parentDirectory.childs?.indexOf(
          file._id,
        ) as unknown as number;
        const array = parentDirectory.childs || [];

        while (index !== -1) {
          parentDirectory.childs?.splice(index, 1);
          index = array.indexOf(file._id);
        }

        await this.fileRepository.saveNewChilds(
          parentDirectory._id,
          parentDirectory.childs,
        );
      }

      await this.fileRepository.addChilds(newParentDirectory._id, [file._id]);

      const newFileName = name + '.' + file.type;
      file.parent = newParentDirectory._id;
      file.name = newFileName;

      await this.fileRepository.update({
        fileId: file._id,
        name: newFileName,
        parent: newParentDirectory._id,
      });

      return file;
    }

    if (name) {
      const newFileName = name + '.' + file.type;
      file.name = newFileName;

      await this.fileRepository.update({ fileId: file._id, name: newFileName });

      return file;
    }

    if (parentId) {
      const newParentDirectory = await this.getParentFile(parentId, userId);

      // delete all the files from old parent directory
      if (file.parent) {
        const parentDirectory = await this.getParentFile(
          String(file.parent),
          userId,
        );
        let index = parentDirectory.childs?.indexOf(
          file._id,
        ) as unknown as number;
        const array = parentDirectory.childs || [];

        while (index !== -1) {
          parentDirectory.childs?.splice(index, 1);
          index = array.indexOf(file._id);
        }

        await this.fileRepository.saveNewChilds(
          parentDirectory._id,
          parentDirectory.childs,
        );
      }

      await this.fileRepository.addChilds(newParentDirectory._id, [file._id]);

      file.parent = newParentDirectory._id;

      await this.fileRepository.update({
        fileId: file._id,
        parent: newParentDirectory._id,
      });

      return file;
    }
  }

  async delete(id: string, userId: Types.ObjectId) {
    const isValidId = isValidObjectId(id);

    if (!isValidId) throw new HttpError('File id is not valid', 400);

    const file = await this.getOne(id, userId);

    file.childs?.length
      ? Promise.all([
          this.deleteChilds(file, userId),
          this.deleteFileFromParent(file._id, file.parent, userId),
        ])
      : await this.deleteFileFromParent(file._id, file.parent, userId);

    const deletedFile = await this.fileRepository.delete({
      _id: id,
      userId: userId,
    });

    return deletedFile;
  }

  async getParentFile(parentId: string, userId: Types.ObjectId) {
    const isValidId = isValidObjectId(parentId);

    if (!isValidId) throw new HttpError('Directory id is not valid', 400);

    const fileParent = await this.fileRepository.getOne(
      new Types.ObjectId(parentId),
    );

    if (!fileParent || fileParent.type !== 'directory') {
      throw new HttpError('Directory not exist', 404);
    }

    if (String(fileParent.userId) !== String(userId)) {
      throw new HttpError('User not have permission to access this file', 403);
    }

    return fileParent;
  }

  private async deleteChilds(file: IFile, userId: Types.ObjectId) {
    file.childs?.forEach(async (fileId) => {
      const isParent = await this.fileRepository.getOneWithUser(
        { _id: fileId },
        userId,
      );

      if (isParent?.childs?.length) await this.deleteChilds(isParent, userId);

      await this.fileRepository.delete({ _id: fileId });
    });
  }

  private async deleteFileFromParent(
    fileId: Types.ObjectId,
    parentId: Types.ObjectId | null,
    userId: Types.ObjectId,
  ) {
    if (parentId) {
      await this.fileRepository.deleteFileFromParent({
        fileId,
        parentId,
        userId,
      });
    }
  }

  private async checkLinkExp(files: IFile[]) {
    const oneHour = 3600000;

    files.forEach(async (file) => {
      if (
        file.type !== 'directory' &&
        Number(file.updatedAt) + oneHour <= Date.now()
      ) {
        const newLink = await this.getLink(file.storageId!);

        await this.fileRepository.saveFileLink(file._id, newLink);
      }
    });
  }

  private async saveFile(path: string, fileOptions: FileOptions) {
    const encryptedFilePath = await DataEncode.encrypt(
      path,
      fileOptions.secret,
    );
    const file = await this.botService.sendDocs(encryptedFilePath, fileOptions);

    if (!file) throw new HttpError('Internal Server Error', 500);

    this.deleteFromDisk(encryptedFilePath);

    return file;
  }

  private deleteFromDisk(path: string) {
    unlink(path, (err) => {
      if (err) throw err;
    });
  }

  private async getLink(id: string) {
    const link = await this.botService.getLink(id);
    return link;
  }
}

export default FileService;
