import { Types } from 'mongoose';

import path from 'node:path';
import fs from 'fs';
import MockFileRepository from './mock/files.reposotory.mock';
import FileService from '../../src/files/files.service';
import { BotService } from '../../src/bot/bot.service';
import { IFileRepository } from '../../src/files/model/files.repository-interface';
import { IFile } from '../../src/files/model/files.interface';
import MockBotService from './mock/bot.service.mock';
import { fileMock, filesMock, mockDirectory } from './mock/files.mock';
import { Sort } from '../../src/files/types/files.sort';
import { HttpError } from '../../src/utils/Error';
import { deleteResultMock } from '../users/mock/user.mock';
import { CreateFileDto } from '../../src/files/dto/create-file.dto';

describe('FileService', () => {
  let fileRepository: IFileRepository<IFile>;
  let botService: BotService;
  let fileService: FileService;
  const userId = new Types.ObjectId('64520c9ea01cb5187c1090cb');

  beforeAll(() => {
    const directoryPath = path.resolve(__dirname, '..', '..', 'src', 'storage');

    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }
  });

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
    it('should create a new file in root (null parent)', async () => {
      const file = await fileService.create(
        'new file.png',
        20000,
        ['someId'],
        userId,
      );

      expect(file).toMatchObject<IFile>({
        name: expect.any(String),
        _id: expect.any(Types.ObjectId),
        size: expect.any(Number),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        type: expect.any(String),
        userId: expect.any(Types.ObjectId),
        parent: null,
        isComposed: expect.any(Boolean),
      });

      expect(file.name).toEqual('new file.png');
      expect(file.type).toEqual('png');
      expect(file.size).toEqual(20000);
      expect(file.userId).toEqual(userId);
      expect(file.parent).toEqual(null);
      expect(file.isComposed).toEqual(false);
      expect(file.chunks).toEqual(undefined);
    });

    it('should create a new file with parent id', async () => {
      jest.spyOn(fileRepository, 'getOne').mockResolvedValueOnce(mockDirectory);
      const file = await fileService.create(
        'new file.png',
        20000,
        ['someId'],
        userId,
        mockDirectory._id.toString(),
      );

      expect(file).toMatchObject<IFile>({
        name: expect.any(String),
        _id: expect.any(Types.ObjectId),
        size: expect.any(Number),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        type: expect.any(String),
        userId: expect.any(Types.ObjectId),
        parent: expect.any(Types.ObjectId),
        isComposed: expect.any(Boolean),
      });

      expect(file.name).toEqual('new file.png');
      expect(file.type).toEqual('png');
      expect(file.size).toEqual(20000);
      expect(file.userId).toEqual(userId);
      expect(file.parent).toEqual(mockDirectory._id);
      expect(file.isComposed).toEqual(false);
      expect(file.chunks).toEqual(undefined);
    });

    it('should thrown an error when creating a new file with an invalid parent id', async () => {
      const file = fileService.create(
        'new file.png',
        20000,
        ['someId'],
        userId,
        '1234',
      );

      expect(file).rejects.toMatchObject(
        new HttpError('Directory id is not valid', 400),
      );
    });
    it('should thrown an error when creating a new file with a wrong parent id', async () => {
      const file = fileService.create(
        'new file.png',
        20000,
        ['someId'],
        userId,
        mockDirectory._id.toString(),
      );

      expect(file).rejects.toMatchObject(
        new HttpError('Directory not exist', 404),
      );
    });

    it('should thrown an error when creating a new file with a wrong user id', async () => {
      jest.spyOn(fileRepository, 'getOne').mockResolvedValueOnce(mockDirectory);

      const file = fileService.create(
        'new file.png',
        20000,
        ['someId'],
        new Types.ObjectId(),
        mockDirectory._id.toString(),
      );

      expect(file).rejects.toMatchObject(
        new HttpError('User not have permission to access this file', 403),
      );
    });

    it('should create a new composed file in root (null parent)', async () => {
      const file = await fileService.create(
        'new file.png',
        20000,
        ['someId', 'someId2'],
        userId,
      );

      expect(file).toMatchObject<IFile>({
        name: expect.any(String),
        _id: expect.any(Types.ObjectId),
        size: expect.any(Number),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        type: expect.any(String),
        userId: expect.any(Types.ObjectId),
        parent: null,
        isComposed: expect.any(Boolean),
      });

      expect(file.name).toEqual('new file.png');
      expect(file.type).toEqual('png');
      expect(file.size).toEqual(20000);
      expect(file.userId).toEqual(userId);
      expect(file.parent).toEqual(null);
      expect(file.isComposed).toEqual(true);
      expect(file.chunks).toEqual(['someId', 'someId2']);
    });

    it('should create a new composed file in root with parent', async () => {
      jest.spyOn(fileRepository, 'getOne').mockResolvedValueOnce(mockDirectory);
      const file = await fileService.create(
        'new file.png',
        20000,
        ['someId', 'someId2'],
        userId,
        mockDirectory._id.toString(),
      );

      expect(file).toMatchObject<IFile>({
        name: expect.any(String),
        _id: expect.any(Types.ObjectId),
        size: expect.any(Number),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        type: expect.any(String),
        userId: expect.any(Types.ObjectId),
        parent: expect.any(Types.ObjectId),
        isComposed: expect.any(Boolean),
      });

      expect(file.name).toEqual('new file.png');
      expect(file.type).toEqual('png');
      expect(file.size).toEqual(20000);
      expect(file.userId).toEqual(userId);
      expect(file.parent).toEqual(mockDirectory._id);
      expect(file.isComposed).toEqual(true);
      expect(file.chunks).toEqual(['someId', 'someId2']);
    });

    it('should thrown an error when creating a new composed file with an invalid parent id', async () => {
      const file = fileService.create(
        'new file.png',
        20000,
        ['someId', 'someId2'],
        userId,
        '1234',
      );

      expect(file).rejects.toMatchObject(
        new HttpError('Directory id is not valid', 400),
      );
    });
    it('should thrown an error when creating a new composed file with a wrong parent id', async () => {
      const file = fileService.create(
        'new file.png',
        20000,
        ['someId', 'someId2'],
        userId,
        mockDirectory._id.toString(),
      );

      expect(file).rejects.toMatchObject(
        new HttpError('Directory not exist', 404),
      );
    });

    it('should thrown an error when creating a new composed file with a wrong user id', async () => {
      jest.spyOn(fileRepository, 'getOne').mockResolvedValueOnce(mockDirectory);

      const file = fileService.create(
        'new file.png',
        20000,
        ['someId', 'someId2'],
        new Types.ObjectId(),
        mockDirectory._id.toString(),
      );

      expect(file).rejects.toMatchObject(
        new HttpError('User not have permission to access this file', 403),
      );
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
        isComposed: false,
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
        isComposed: false,
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
        .mockResolvedValueOnce({ ...fileMock, parent: null })
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
        isComposed: fileMock.isComposed,
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
        isComposed: fileMock.isComposed,
      });
    });

    it('should update parent only', async () => {
      jest
        .spyOn(fileRepository, 'getOne')
        .mockResolvedValueOnce({ ...fileMock, parent: null })
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
        isComposed: fileMock.isComposed,
      });
    });

    it('should thrown an error when new directory id is equal to an old one', async () => {
      jest
        .spyOn(fileRepository, 'getOne')
        .mockResolvedValueOnce(fileMock)
        .mockResolvedValue(mockDirectory);

      expect(
        fileService.update(
          String(fileMock._id),
          userId,
          undefined,
          String(mockDirectory._id),
        ),
      ).rejects.toMatchObject({
        message: 'Unable to add an existing file to the directory',
        status: 409,
      });
    });
  });

  describe('delete', () => {
    it('deletes a file with no childs and no parent', async () => {
      jest
        .spyOn(fileService as any, 'getParentFile')
        .mockImplementationOnce(async () => {
          return {
            ...fileMock,
            type: 'directory',
            _id: new Types.ObjectId(),
          };
        });
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
});
