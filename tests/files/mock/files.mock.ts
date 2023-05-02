import { Types } from 'mongoose';
import { IFile } from '../../../src/files/model/files.interface';

export const fileMock: IFile = {
  _id: new Types.ObjectId('50958c9f0000000000000000'),
  name: 'TestFile name',
  size: 50,
  createdAt: new Date(),
  updatedAt: new Date(),
  type: 'png',
  userId: new Types.ObjectId('40958c9f0000000000000000'),
  parent: null,
};
