import {UpdateResult, DeleteResult} from 'mongodb';
export interface IFileRepository<IFile> {
  create: (obj: IFile) => Promise<IFile>;
  getAll: () => Promise<IFile[]>;
  getOne: (query: object) => Promise<IFile | null>;
  update: (obj: IFile) => Promise<UpdateResult>; 
  delete: (obj: IFile) => Promise<DeleteResult>; 
}