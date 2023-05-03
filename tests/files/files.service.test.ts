import { Types } from 'mongoose';

import MockFileRepository from './mock/files.reposotory.mock';
import FileService from '../../src/files/files.service';
import { BotService } from '../../src/bot/bot.service';
import { IFileRepository } from '../../src/files/model/files.repository-interface';
import { IFile } from '../../src/files/model/files.interface';
import MockBotService from './mock/bot.service.mock';
import { fileMock, filesMock } from './mock/files.mock';
import { Sort } from '../../src/files/types/files.sort';
import { HttpError } from '../../src/utils/Error';

describe('FileService', () => {
  let fileRepository: IFileRepository<IFile>;
  let botService: BotService;
  let fileService: FileService;
  const userId = new Types.ObjectId('64520c9ea01cb5187c1090cb');

  beforeAll(() => {
    fileRepository = new MockFileRepository();
    botService = new MockBotService() as unknown as BotService;

    fileService = new FileService(fileRepository, botService);
  });

  describe('getAll', () => {
    it('should return an array of files with all valid parameters', async () => {
      const testParentId = new Types.ObjectId();
      jest.spyOn(fileRepository, 'getOne').mockImplementationOnce(async () => ({
        _id: new Types.ObjectId(),
        name: 'file2',
        parent: testParentId,
        userId: new Types.ObjectId('64520c9ea01cb5187c1090cb'),
        size: 2048,
        type: 'directory',
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      const result = await fileService.getAll(
        userId,
        String(testParentId),
        Sort.Name,
      );

      expect(result).toHaveLength(2);
      expect(result).toEqual(filesMock);
    });

    it('should return an array of files only with parent parameter', async () => {
      const testParentId = new Types.ObjectId();
      jest.spyOn(fileRepository, 'getOne').mockImplementationOnce(async () => ({
        _id: new Types.ObjectId(),
        name: 'file2',
        parent: testParentId,
        userId: new Types.ObjectId('64520c9ea01cb5187c1090cb'),
        size: 2048,
        type: 'directory',
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      const result = await fileService.getAll(
        userId,
        String(testParentId),
        undefined,
      );

      expect(result).toHaveLength(2);
      expect(result).toEqual(filesMock);
    });

    it('should return an array of files only with sortBy parameter', async () => {
      const result = await fileService.getAll(userId, undefined, undefined);

      expect(result).toHaveLength(2);
      expect(result).toEqual(filesMock);
    });

    it('should throw an HttpError if parent is not valid directory id', async () => {
      try {
        const result = await fileService.getAll(userId, 'some-id', undefined);
      } catch (e: unknown) {
        expect(e).toBeInstanceOf(HttpError);
        expect(e).toMatchObject({
          message: 'Directory id is not valid',
          status: 400,
        });
      }
    });
  });

  describe('getOne', () => {
    it('should return the file if it exists and the user has permission to access it', async () => {
      const id = new Types.ObjectId().toHexString();

      const result = await fileService.getOne(String(fileMock._id), userId);
      expect(result).toEqual(fileMock);
    });

    it('should throw an error if file id is not valid', async () => {
      const id = 'invalid-id';

      expect(fileService.getOne(id, userId)).rejects.toMatchObject({
        message: 'File id is not valid',
        status: 400,
      });
    });

    it('should throw an error if file is not found', async () => {
      const id = new Types.ObjectId().toHexString();

      expect(fileService.getOne(id, userId)).rejects.toMatchObject({
        message: 'File not found',
        status: 404,
      });
    });

    it('should throw an error if user does not have permission to access the file', async () => {
      const fakeUserId = new Types.ObjectId();
      expect(
        fileService.getOne(String(fileMock._id), fakeUserId),
      ).rejects.toBeInstanceOf(HttpError);
      expect(
        fileService.getOne(String(fileMock._id), fakeUserId),
      ).rejects.toMatchObject({
        message: 'User not have permission to access this file',
        status: 403,
      });
    });
  });

  describe('download', () => {
    it('should call the bot service with the correct parameters and return the expected object', async () => {
      const result = await fileService.download(String(fileMock._id), userId);

      expect(result).toEqual({
        name: fileMock.name,
        link: fileMock.link,
        secret: fileMock.userId.toString(),
      });
    });

    it('should throw an error if the file is a directory', async () => {
      const directoryId = new Types.ObjectId();
      const mockDirectory = {
        _id: directoryId,
        name: 'directory name',
        parent: null,
        userId: userId,
        size: 2048,
        type: 'directory',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(fileRepository, 'getOne')
        .mockImplementationOnce(async () => mockDirectory);

      expect(
        fileService.download(String(directoryId), userId),
      ).rejects.toBeInstanceOf(HttpError);

      jest
        .spyOn(fileRepository, 'getOne')
        .mockImplementationOnce(async () => mockDirectory);

      expect(
        fileService.download(String(directoryId), userId),
      ).rejects.toMatchObject({
        message: 'Can not get folder',
        status: 400,
      });
    });

    it('should throw an error if the file not found', async () => {
      const directoryId = new Types.ObjectId();

      expect(
        fileService.download(String(directoryId), userId),
      ).rejects.toBeInstanceOf(HttpError);
      expect(
        fileService.download(String(directoryId), userId),
      ).rejects.toMatchObject({
        message: 'File not found',
        status: 404,
      });
    });

    it('should throw an error if the file id is not valid', async () => {
      expect(fileService.download('not valid', userId)).rejects.toBeInstanceOf(
        HttpError,
      );
      expect(fileService.download('not valid', userId)).rejects.toMatchObject({
        message: 'File id is not valid',
        status: 400,
      });
    });

    it('should throw an error if user not has a permission to access the file', async () => {
      expect(
        fileService.download(fileMock._id.toString(), new Types.ObjectId()),
      ).rejects.toBeInstanceOf(HttpError);
      expect(
        fileService.download(fileMock._id.toString(), new Types.ObjectId()),
      ).rejects.toMatchObject({
        message: 'User not have permission to access this file',
        status: 403,
      });
    });
  });
});
