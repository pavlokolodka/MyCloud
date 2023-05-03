import { Types } from 'mongoose';
import { IFile } from '../../../src/files/model/files.interface';

export const fileMock: IFile = {
  _id: new Types.ObjectId('50958c9f0000000000000000'),
  name: 'TestFile name',
  size: 50,
  createdAt: new Date(),
  updatedAt: new Date(),
  type: 'png',
  userId: new Types.ObjectId('64520c9ea01cb5187c1090cb'),
  parent: null,
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
  },
];
