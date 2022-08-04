import {UpdateResult, DeleteResult} from 'mongodb';


export interface IFileRepository<IFile> {
  create: (query: IFile) => Promise<IFile>;
  getAll: (query: object, sortBy: string) => Promise<IFile[]>;
  getOne: (query: object) => Promise<IFile | null>;
  update: (query: IFile) => Promise<UpdateResult>; 
  delete: (query: object) => Promise<DeleteResult>; 
  deleteParent: (query: object, action: object) => Promise<UpdateResult>;
}