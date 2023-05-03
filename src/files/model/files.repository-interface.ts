import { UpdateResult, DeleteResult } from 'mongodb';
import mongoose from 'mongoose';
import { CreateFileDto } from '../dto/create-file.dto';
import { UpdateFileDto } from '../dto/update-file.dto';
import { Sort } from '../types/files.sort';

export interface IFileRepository<T> {
  create: (query: CreateFileDto) => Promise<T>;
  getAll: (query: object, sortBy?: Sort) => Promise<T[]>;
  getOne: (id: mongoose.Types.ObjectId) => Promise<T | null>;
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
