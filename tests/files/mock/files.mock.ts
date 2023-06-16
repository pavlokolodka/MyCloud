import { Types } from 'mongoose';
import { IFile } from '../../../src/files/model/files.interface';
import {
  TelegramAudioDocument,
  TelegramDocument,
} from '../../../src/bot/types/telegram-file.type';

export const fileMock: IFile = {
  _id: new Types.ObjectId('50958c9f0000000000000000'),
  name: 'TestFile name.png',
  size: 50,
  createdAt: new Date(),
  updatedAt: new Date(),
  type: 'png',
  userId: new Types.ObjectId('64520c9ea01cb5187c1090cb'),
  parent: new Types.ObjectId('643a7e929cc0fb9639f98d0c'),
  isComposed: false,
};
export const mockDirectory = {
  _id: new Types.ObjectId('643a7e929cc0fb9639f98d0c'),
  name: 'directory name',
  parent: null,
  userId: new Types.ObjectId('64520c9ea01cb5187c1090cb'),
  size: 2048,
  type: 'directory',
  createdAt: new Date(),
  updatedAt: new Date(),
  isComposed: false,
};

export const filesMock: IFile[] = [
  {
    _id: new Types.ObjectId(),
    name: 'file2',
    parent: new Types.ObjectId(),
    userId: new Types.ObjectId('64520c9ea01cb5187c1090cb'),
    size: 2048,
    type: 'jpg',
    link: 'http://localhost:9000/',
    createdAt: new Date(),
    updatedAt: new Date(),
    isComposed: false,
  },
  {
    _id: new Types.ObjectId(),
    name: 'file2',
    parent: new Types.ObjectId(),
    userId: new Types.ObjectId('64520c9ea01cb5187c1090cb'),
    size: 2048,
    type: 'json',
    link: 'http://localhost:9000/',
    createdAt: new Date(),
    updatedAt: new Date(),
    isComposed: false,
  },
];

export const telegramDocumentMock: TelegramDocument = {
  message_id: 123,
  from: {
    id: 456,
    is_bot: false,
    first_name: 'John',
    username: 'john_doe',
  },
  chat: {
    id: 789,
    first_name: 'Jane',
    username: 'jane_doe',
    type: 'private',
  },
  date: 1620059627,
  document: {
    file_name: 'test.txt',
    mime_type: 'text/plain',
    file_id: '123456789',
    file_unique_id: 'unique_id_123',
    file_size: 123,
  },
};

export const telegramAudioDocumentMock: TelegramAudioDocument = {
  message_id: 1234,
  from: {
    id: 5678,
    is_bot: false,
    first_name: 'John',
    username: 'john_doe',
  },
  chat: {
    id: 1234,
    first_name: 'Jane',
    username: 'jane_doe',
    type: 'private',
  },
  date: 1620115229,
  audio: {
    duration: 180,
    file_name: 'sample.mp3',
    mime_type: 'audio/mpeg',
    title: 'Sample audio',
    performer: 'Sample artist',
    file_id: 'AQADBAADR6sxGgA=',
    file_unique_id: 'UniqueID1234567890',
    file_size: 1234567,
  },
};
