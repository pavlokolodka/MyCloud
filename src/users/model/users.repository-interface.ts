import {UpdateResult, DeleteResult} from 'mongodb';


export interface IUserRepository<IUser> {
  create: (query: IUser) => Promise<IUser>;
  getAll: (query: object) => Promise<IUser[]>;
  getOne: (query: object) => Promise<IUser | null>;
  update: (query: IUser) => Promise<UpdateResult>; 
  delete: (query: object) => Promise<DeleteResult>; 
}