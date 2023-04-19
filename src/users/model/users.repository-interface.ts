import { UpdateResult, DeleteResult } from 'mongodb';
import { CreateUserDto } from '../dto/create-user.dto';

export interface IUserRepository<T> {
  create: (query: CreateUserDto) => Promise<T>;
  getAll: (query: object) => Promise<T[]>;
  getOne: (query: object) => Promise<T | null>;
  update: (query: T) => Promise<UpdateResult>;
  delete: (query: object) => Promise<DeleteResult>;
}
