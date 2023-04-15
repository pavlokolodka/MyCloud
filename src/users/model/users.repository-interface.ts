import { UpdateResult, DeleteResult } from 'mongodb';
import { CreateUserDto } from '../dto/create-user.dto';

export interface IUserRepository<IUser> {
  create: (query: CreateUserDto) => Promise<IUser>;
  getAll: (query: object) => Promise<IUser[]>;
  getOne: (query: object) => Promise<IUser | null>;
  update: (query: IUser) => Promise<UpdateResult>;
  delete: (query: object) => Promise<DeleteResult>;
}
