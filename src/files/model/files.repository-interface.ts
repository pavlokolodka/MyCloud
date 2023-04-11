import { UpdateResult, DeleteResult } from 'mongodb';
import mongoose from 'mongoose';

export interface IFileRepository<IFile> {
  create: (query: IFile) => Promise<IFile>;
  getAll: (query: object, sortBy: string) => Promise<IFile[]>;
  getOne: (
    query: object,
    userId: mongoose.Types.ObjectId,
  ) => Promise<IFile | null>;
  update: (query: IFile) => Promise<UpdateResult>;
  delete: (query: object) => Promise<DeleteResult>;
  deleteParent: (query: object, action: object) => Promise<UpdateResult>;
}
