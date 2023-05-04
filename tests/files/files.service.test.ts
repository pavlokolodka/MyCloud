import { Types } from 'mongoose';

import MockFileRepository from './mock/files.reposotory.mock';
import FileService from '../../src/files/files.service';
import { BotService } from '../../src/bot/bot.service';
import { IFileRepository } from '../../src/files/model/files.repository-interface';
import { IFile } from '../../src/files/model/files.interface';
import MockBotService from './mock/bot.service.mock';
import {
  fileMock,
  filesMock,
  telegramAudioDocumentMock,
  telegramDocumentMock,
} from './mock/files.mock';
import { Sort } from '../../src/files/types/files.sort';
import { HttpError } from '../../src/utils/Error';
import { promises } from 'node:fs';
import path from 'node:path';
import { deleteResultMock } from '../users/mock/user.mock';

describe('FileService', () => {
  let fileRepository: IFileRepository<IFile>;
  let botService: BotService;
  let fileService: FileService;
  const userId = new Types.ObjectId('64520c9ea01cb5187c1090cb');
  const mockDirectory = {
    _id: new Types.ObjectId(),
    name: 'directory name',
    parent: null,
    userId: userId,
    size: 2048,
    type: 'directory',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    fileRepository = new MockFileRepository();
    botService = new MockBotService() as unknown as BotService;

    fileService = new FileService(fileRepository, botService);
  });

  describe('getAll', () => {
    it('should return an array of files with all valid parameters', async () => {
      const testParentId = new Types.ObjectId();
      jest
        .spyOn(fileRepository, 'getOne')
        .mockImplementationOnce(async () => mockDirectory);
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
      jest
        .spyOn(fileRepository, 'getOne')
        .mockImplementationOnce(async () => mockDirectory);
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
      jest
        .spyOn(fileRepository, 'getOne')
        .mockImplementationOnce(async () => mockDirectory);

      expect(
        fileService.download(String(mockDirectory._id), userId),
      ).rejects.toBeInstanceOf(HttpError);

      jest
        .spyOn(fileRepository, 'getOne')
        .mockImplementationOnce(async () => mockDirectory);

      expect(
        fileService.download(String(mockDirectory._id), userId),
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

  describe('create', () => {
    it('should create a new file', async () => {
      const filePath = path.resolve(
        __dirname,
        '..',
        '..',
        'src',
        'storage',
        'test.txt',
      );
      const newMockFile = await promises.writeFile(filePath, 'test content');
      const reqFile = {
        name: 'test.txt',
        type: 'text/plain',
        size: 123,
        path: filePath,
      };

      const result = await fileService.create(reqFile, userId);

      expect(result).toBeDefined();
      expect(result).toEqual<IFile>({
        _id: expect.any(Types.ObjectId),
        name: reqFile.name,
        size: reqFile.size,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        type: 'txt',
        userId: userId,
        parent: null,
        link: `https://example.com/${telegramDocumentMock.document.file_id}`,
        storageId: telegramDocumentMock.document.file_id,
        childs: undefined,
      });
    });

    it('should create a new audio file', async () => {
      const filePath = path.resolve(
        __dirname,
        '..',
        '..',
        'src',
        'storage',
        'sample.mp3',
      );
      const newMockFile = await promises.writeFile(filePath, 'test content');
      const reqFile = {
        name: 'sample.mp3',
        type: 'audio/mpeg',
        size: 123,
        path: filePath,
      };

      const result = await fileService.create(reqFile, userId);

      expect(result).toBeDefined();
      expect(result).toEqual<IFile>({
        _id: expect.any(Types.ObjectId),
        name: reqFile.name,
        size: reqFile.size,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        type: 'mp3',
        userId: userId,
        parent: null,
        link: `https://example.com/${telegramAudioDocumentMock.audio.file_id}`,
        storageId: telegramAudioDocumentMock.audio.file_id,
        childs: undefined,
      });
    });

    it('should create a new file with parent id', async () => {
      const filePath = path.resolve(
        __dirname,
        '..',
        '..',
        'src',
        'storage',
        'test.txt',
      );
      const newMockFile = await promises.writeFile(filePath, 'test content');
      const reqFile = {
        name: 'test.txt',
        type: 'text/plain',
        size: 123,
        path: filePath,
      };

      jest
        .spyOn(fileRepository, 'getOne')
        .mockImplementationOnce(async () => mockDirectory);

      const result = await fileService.create(
        reqFile,
        userId,
        String(mockDirectory._id),
      );

      expect(result).toBeDefined();
      expect(result).toEqual<IFile>({
        _id: expect.any(Types.ObjectId),
        name: reqFile.name,
        size: reqFile.size,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        type: 'txt',
        userId: userId,
        parent: mockDirectory._id,
        link: `https://example.com/${telegramDocumentMock.document.file_id}`,
        storageId: telegramDocumentMock.document.file_id,
        childs: undefined,
      });
    });

    it('should create a new audio file with parent id', async () => {
      const filePath = path.resolve(
        __dirname,
        '..',
        '..',
        'src',
        'storage',
        'sample.mp3',
      );
      const newMockFile = await promises.writeFile(filePath, 'test content');
      const reqFile = {
        name: 'sample.mp3',
        type: 'audio/mpeg',
        size: 123,
        path: filePath,
      };

      jest
        .spyOn(fileRepository, 'getOne')
        .mockImplementationOnce(async () => mockDirectory);

      const result = await fileService.create(
        reqFile,
        userId,
        String(mockDirectory._id),
      );

      expect(result).toBeDefined();
      expect(result).toEqual<IFile>({
        _id: expect.any(Types.ObjectId),
        name: reqFile.name,
        size: reqFile.size,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        type: 'mp3',
        userId: userId,
        parent: mockDirectory._id,
        link: `https://example.com/${telegramAudioDocumentMock.audio.file_id}`,
        storageId: telegramAudioDocumentMock.audio.file_id,
        childs: undefined,
      });
    });

    it('should throw an error when create a new file with id that belongs to plain file (not directory)', async () => {
      const filePath = path.resolve(
        __dirname,
        '..',
        '..',
        'src',
        'storage',
        'test.txt',
      );
      const newMockFile = await promises.writeFile(filePath, 'test content');
      const reqFile = {
        name: 'test.txt',
        type: 'text/plain',
        size: 123,
        path: filePath,
      };

      const result = fileService.create(reqFile, userId, String(fileMock._id));

      expect(result).rejects.toMatchObject({
        message: 'Directory not exist',
        status: 404,
      });
    });

    it('should throw an error when create a new file with invalid id', async () => {
      const filePath = path.resolve(
        __dirname,
        '..',
        '..',
        'src',
        'storage',
        'test1.txt',
      );
      const newMockFile = await promises.writeFile(filePath, 'test content');
      const reqFile = {
        name: 'test1.txt',
        type: 'text/plain',
        size: 123,
        path: filePath,
      };

      const result = fileService.create(reqFile, userId, 'invalid-id');

      expect(result).rejects.toMatchObject({
        message: 'Directory id is not valid',
        status: 400,
      });
    });

    it('should throw an error when create a new file with non-existent parent file', async () => {
      const filePath = path.resolve(
        __dirname,
        '..',
        '..',
        'src',
        'storage',
        'test2.txt',
      );
      const newMockFile = await promises.writeFile(filePath, 'test content');
      const reqFile = {
        name: 'test2.txt',
        type: 'text/plain',
        size: 123,
        path: filePath,
      };

      const result = fileService.create(
        reqFile,
        userId,
        String(new Types.ObjectId(4294967295)),
      );

      expect(result).rejects.toMatchObject({
        message: 'Directory not exist',
        status: 404,
      });
    });

    it('should throw an error when create a new file with wrong user id and with valid and existing parent id', async () => {
      const filePath = path.resolve(
        __dirname,
        '..',
        '..',
        'src',
        'storage',
        'test3.txt',
      );
      const newMockFile = await promises.writeFile(filePath, 'test content');
      const reqFile = {
        name: 'test3.txt',
        type: 'text/plain',
        size: 123,
        path: filePath,
      };

      jest.spyOn(fileRepository, 'getOne').mockResolvedValueOnce(mockDirectory);

      try {
        const result = await fileService.create(
          reqFile,
          new Types.ObjectId(),
          String(mockDirectory._id),
        );
      } catch (error) {
        expect(error).toBeInstanceOf(HttpError);
        expect(error).toMatchObject({
          message: 'User not have permission to access this file',
          status: 403,
        });
      }
    });
  });

  describe('createDirectory', () => {
    it('should create a directory in root (null parent)', async () => {
      const directoryName = 'My Folder';
      const directory = await fileService.createDirectory(
        directoryName,
        userId,
      );

      expect(directory).toBeDefined();
      expect(directory).toEqual<IFile>({
        _id: expect.any(Types.ObjectId),
        name: directoryName,
        size: 0,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        type: 'directory',
        userId: userId,
        parent: null,
        childs: [],
        link: undefined,
        storageId: undefined,
      });
    });

    it('should create a subdirectory', async () => {
      const subdirectoryName = 'Subdirectory';
      jest.spyOn(fileRepository, 'getOne').mockResolvedValueOnce(mockDirectory);
      const subdirectory = await fileService.createDirectory(
        subdirectoryName,
        userId,
        mockDirectory._id.toString(),
      );

      expect(subdirectory).toBeDefined();
      expect(subdirectory).toEqual<IFile>({
        _id: expect.any(Types.ObjectId),
        name: subdirectoryName,
        size: 0,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        type: 'directory',
        userId: userId,
        parent: mockDirectory._id,
        childs: [],
        link: undefined,
        storageId: undefined,
      });
    });

    it('should throw an error when parent id is not valid', async () => {
      const subdirectoryName = 'Subdirectory';
      const subdirectory = fileService.createDirectory(
        subdirectoryName,
        userId,
        'notvalid',
      );

      expect(subdirectory).rejects.toMatchObject({
        message: 'Directory id is not valid',
        status: 400,
      });
    });
  });

  describe('update', () => {
    it('should update name and parent', async () => {
      jest
        .spyOn(fileRepository, 'getOne')
        .mockResolvedValueOnce(fileMock)
        .mockResolvedValue(mockDirectory);
      const updatedFile = await fileService.update(
        String(fileMock._id),
        userId,
        'new name',
        String(mockDirectory._id),
      );

      expect(updatedFile).toBeDefined();
      expect(updatedFile).toEqual<IFile>({
        _id: expect.any(Types.ObjectId),
        name: 'new name' + '.' + fileMock.type,
        size: fileMock.size,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        type: fileMock.type,
        userId: fileMock.userId,
        parent: mockDirectory._id,
        childs: fileMock.childs,
        link: fileMock.link,
        storageId: fileMock.storageId,
      });
    });

    it('should update name only', async () => {
      const updatedFile = await fileService.update(
        String(fileMock._id),
        userId,
        'new name',
      );

      expect(updatedFile).toBeDefined();
      expect(updatedFile).toEqual<IFile>({
        _id: expect.any(Types.ObjectId),
        name: 'new name' + '.' + fileMock.type,
        size: fileMock.size,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        type: fileMock.type,
        userId: fileMock.userId,
        parent: fileMock.parent,
        childs: fileMock.childs,
        link: fileMock.link,
        storageId: fileMock.storageId,
      });
    });

    it('should update parent only', async () => {
      jest
        .spyOn(fileRepository, 'getOne')
        .mockResolvedValueOnce(fileMock)
        .mockResolvedValue(mockDirectory);
      const updatedFile = await fileService.update(
        String(fileMock._id),
        userId,
        undefined,
        String(mockDirectory._id),
      );

      expect(updatedFile).toBeDefined();
      expect(updatedFile).toEqual<IFile>({
        _id: expect.any(Types.ObjectId),
        name: fileMock.name,
        size: fileMock.size,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        type: fileMock.type,
        userId: fileMock.userId,
        parent: mockDirectory._id,
        childs: fileMock.childs,
        link: fileMock.link,
        storageId: fileMock.storageId,
      });
    });
  });

  describe('delete', () => {
    it('deletes a file with no childs and no parent', async () => {
      expect(fileService.delete(String(fileMock._id), userId)).resolves.toEqual(
        deleteResultMock,
      );
    });

    it('throws an error if file id is not valid', async () => {
      const invalidId = 'invalid-id';

      expect(fileService.delete(invalidId, userId)).rejects.toThrowError(
        HttpError,
      );
      expect(fileService.delete(invalidId, userId)).rejects.toMatchObject({
        message: 'File id is not valid',
        status: 400,
      });
    });
  });

  describe('getParentFile', () => {
    it('should return the file parent if everything is correct', async () => {
      jest.spyOn(fileRepository, 'getOne').mockResolvedValueOnce(mockDirectory);

      const result = await fileService.getParentFile(
        String(mockDirectory._id),
        userId,
      );

      expect(result).toEqual(mockDirectory);
    });

    it('should throw an error if the user does not have permission to access the file', async () => {
      jest.spyOn(fileRepository, 'getOne').mockResolvedValueOnce(mockDirectory);

      expect(
        fileService.getParentFile(
          String(mockDirectory._id),
          new Types.ObjectId(),
        ),
      ).rejects.toMatchObject({
        message: 'User not have permission to access this file',
        status: 403,
      });
    });

    it('should throw an error if the file type is not a directory', async () => {
      expect(
        fileService.getParentFile(String(fileMock._id), userId),
      ).rejects.toMatchObject({
        message: 'Directory not exist',
        status: 404,
      });
    });

    it('should throw an error if the file is not exist', async () => {
      expect(
        fileService.getParentFile(String(new Types.ObjectId()), userId),
      ).rejects.toMatchObject({
        message: 'Directory not exist',
        status: 404,
      });
    });
  });
});
