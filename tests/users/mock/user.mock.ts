import mongoose from 'mongoose';
import { UpdateResult, DeleteResult } from 'mongodb';
import { IUser } from '../../../src/users/model/users.interface';

export const userMock: IUser = {
  _id: new mongoose.Types.ObjectId('60958c9f0000000000000000'),
  name: 'John Doe',
  email: 'johndoe@example.com',
  password: 'password',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const deleteResultMock: DeleteResult = {
  acknowledged: true,
  deletedCount: 1,
};

export const updateResultMock: UpdateResult = {
  acknowledged: true,
  matchedCount: 1,
  modifiedCount: 1,
  upsertedCount: 0,
  upsertedId: new mongoose.Types.ObjectId(),
};
