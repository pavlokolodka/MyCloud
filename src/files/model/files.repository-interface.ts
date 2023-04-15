import { UpdateResult, DeleteResult } from 'mongodb';
import mongoose from 'mongoose';
import { CreateFileDto } from '../dto/create-file.dto';

export interface IFileRepository<T> {
  create: (query: CreateFileDto) => Promise<T>;
  getAll: (query: object, sortBy: string) => Promise<T[]>;
  getOne: (query: object, userId: mongoose.Types.ObjectId) => Promise<T | null>;
  update: (query: T) => Promise<UpdateResult>;
  delete: (query: object) => Promise<DeleteResult>;
  deleteParent: (query: object, action: object) => Promise<UpdateResult>;
}
