import { unlink } from 'fs/promises';
import { Types } from 'mongoose';
import { BotService } from '../bot/bot.service';
import { isValidObjectId } from '../utils/isObjectId';
import { HttpError } from '../utils/Error';
import { IFile } from './model/files.interface';
import { IFileRepository } from './model/files.repository-interface';
import { TelegramDocument } from '../bot/types/telegram-file.type';
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

  async downloadLarge(id: string, userId: Types.ObjectId) {
    const file = await this.getOne(id, userId);

    if (file.type === 'directory')
      throw new HttpError('Can not get folder', 400);

    const chunkLinks = file.chunks!.map((chunkId: string) => {
      return this.botService.getLink(chunkId);
    });

    return {
      name: file.name,
      chunks: await Promise.all(chunkLinks),
    };
  }

  async create(
    name: string,
    size: number,
    chunks: string[],
    userId: Types.ObjectId,
    parent?: string,
  ) {
    const fileType = name.split('.').pop() as string;
    const chunksLength = chunks.length;
    const fileLink =
      chunksLength === 1 ? await this.botService.getLink(chunks[0]) : undefined;
    const storageId = chunksLength < 1 ? chunks[0] : undefined;
    const isComposed = chunksLength > 1 ? true : false;
    const fileChunks = chunksLength > 1 ? chunks : undefined;
    let fileParent: IFile | undefined,
      newDirecorySize = 0;

    if (parent) {
      fileParent = await this.getParentFile(parent, userId);
      newDirecorySize = fileParent.size + size;
    }

    const fileParentId = fileParent ? fileParent._id : undefined;
    const file = await this.fileRepository.create({
      name,
      size,
      link: fileLink,
      type: fileType,
      storageId,
      userId,
      isComposed,
      chunks: fileChunks,
      parent: fileParentId,
    });

    if (fileParentId) {
      await this.fileRepository.addChilds(fileParentId, newDirecorySize, [
        file._id,
      ]);
    }

    return file;
  }

  async saveLargeFileChunk(reqFile: Buffer) {
    return (await this.botService.sendDocs(reqFile)) as TelegramDocument;
  }

  async createDirectory(name: string, userId: Types.ObjectId, parent?: string) {
    const type = 'directory';

    if (!parent) {
      const directory = await this.fileRepository.create({
        name,
        type,
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

    await this.fileRepository.addChilds(
      parentDirectory._id,
      parentDirectory.size,
      [directory._id],
    );

    return directory;
  }

  async update(
    fileId: string,
    userId: Types.ObjectId,
    name?: string,
    parentId?: string,
  ) {
    const file = await this.getOne(fileId, userId);
    this.checkNewParentDirectory(file.parent, parentId);

    if (name && parentId) {
      const newParentDirectory = await this.getParentFile(parentId, userId);

      // delete all the files from old parent directory
      if (file.parent) {
        const parentDirectory = await this.getParentFile(
          String(file.parent),
          userId,
        );

        const index = parentDirectory.childs?.indexOf(
          file._id,
        ) as unknown as number;
        parentDirectory.childs?.splice(index, 1);
        const newDirecorySize = parentDirectory.size - file.size;

        await this.fileRepository.saveNewChilds(
          parentDirectory._id,
          newDirecorySize,
          parentDirectory.childs,
        );
      }

      const newDirecorySize = newParentDirectory.size + file.size;
      await this.fileRepository.addChilds(
        newParentDirectory._id,
        newDirecorySize,
        [file._id],
      );

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
        const index = parentDirectory.childs?.indexOf(
          file._id,
        ) as unknown as number;
        parentDirectory.childs?.splice(index, 1);
        const newDirecorySize = parentDirectory.size - file.size;

        await this.fileRepository.saveNewChilds(
          parentDirectory._id,
          newDirecorySize,
          parentDirectory.childs,
        );
      }

      const newDirecorySize = newParentDirectory.size + file.size;
      await this.fileRepository.addChilds(
        newParentDirectory._id,
        newDirecorySize,
        [file._id],
      );

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
          this.deleteFileFromParent(file._id, file.parent, userId, file.size),
        ])
      : await this.deleteFileFromParent(
          file._id,
          file.parent,
          userId,
          file.size,
        );

    const deletedFile = await this.fileRepository.delete({
      _id: id,
      userId: userId,
    });

    return deletedFile;
  }

  private async getParentFile(parentId: string, userId: Types.ObjectId) {
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
    fileSize: number,
  ) {
    if (parentId) {
      const fileDirectory = await this.getParentFile(String(parentId), userId);
      const newDirecorySize = fileDirectory.size - fileSize;

      await this.fileRepository.deleteFileFromParent({
        fileId,
        directorySize: newDirecorySize,
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
        !file.isComposed &&
        Number(file.updatedAt) + oneHour <= Date.now()
      ) {
        const newLink = await this.getLink(file.storageId!);

        await this.fileRepository.saveFileLink(file._id, newLink);
      }
    });
  }

  public deleteFromDisk(path: string) {
    return unlink(path);
  }

  private async getLink(id: string) {
    const link = await this.botService.getLink(id);
    return link;
  }

  private checkNewParentDirectory(
    fileParentId: Types.ObjectId | null,
    parentId?: string,
  ) {
    if (String(fileParentId) === String(parentId)) {
      throw new HttpError(
        'Unable to add an existing file to the directory',
        409,
      );
    }
  }
}

export default FileService;
