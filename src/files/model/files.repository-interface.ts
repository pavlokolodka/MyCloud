import { UpdateResult, DeleteResult } from 'mongodb';
import { Types } from 'mongoose';
import { CreateFileDto } from '../dto/create-file.dto';
import { UpdateFileDto } from '../dto/update-file.dto';
import { Sort } from '../types/files.sort';
import { DeleteFromParentDto } from '../dto/delete-parent.dto';

export interface IFileRepository<T> {
  create: (query: CreateFileDto) => Promise<T>;
  getAll: (query: object, sortBy?: Sort) => Promise<T[]>;
  getOne: (id: Types.ObjectId) => Promise<T | null>;
  getOneWithUser: (query: object, userId: Types.ObjectId) => Promise<T | null>;
  update: (query: UpdateFileDto) => Promise<UpdateResult>;
  delete: (query: object) => Promise<DeleteResult>;
  deleteFileFromParent: (query: DeleteFromParentDto) => Promise<UpdateResult>;
  addChilds: (
    parentId: Types.ObjectId,
    directorySize: number,
    childIds: Types.ObjectId[],
  ) => Promise<UpdateResult>;
  saveNewChilds: (
    parentId: Types.ObjectId,
    directorySize: number,
    childIds: Types.ObjectId[] | undefined,
  ) => Promise<UpdateResult>;
  saveFileLink: (
    fileId: Types.ObjectId,
    newLink: string,
  ) => Promise<UpdateResult>;
}
