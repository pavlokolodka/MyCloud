import { UpdateResult, DeleteResult } from 'mongodb';
import mongoose from 'mongoose';
import { CreateFileDto } from '../dto/create-file.dto';
import { UpdateFileDto } from '../dto/update-file.dto';

export interface IFileRepository<T> {
  create: (query: CreateFileDto) => Promise<T>;
  getAll: (query: object, sortBy: string) => Promise<T[]>;
  getOne: (query: object) => Promise<T | null>;
  getOneWithUser: (
    query: object,
    userId: mongoose.Types.ObjectId,
  ) => Promise<T | null>;
  update: (query: UpdateFileDto) => Promise<UpdateResult>;
  delete: (query: object) => Promise<DeleteResult>;
  deleteParent: (query: object, action: object) => Promise<UpdateResult>;
  addChilds: (
    parentId: mongoose.Types.ObjectId,
    childIds: mongoose.Types.ObjectId[],
  ) => Promise<UpdateResult>;
  saveNewChilds: (
    parentId: mongoose.Types.ObjectId,
    childIds: mongoose.Types.ObjectId[] | undefined,
  ) => Promise<UpdateResult>;
  saveFileLink: (
    fileId: mongoose.Types.ObjectId,
    newLink: string,
  ) => Promise<UpdateResult>;
}
