import { UpdateResult, DeleteResult } from 'mongodb';
import { CreateUserDto } from '../dto/create-user.dto';

export interface IUserRepository<T> {
  create: (query: CreateUserDto) => Promise<T>;
  getAll: (query: object) => Promise<T[]>;
  getOne: (id: string) => Promise<T | null>;
  getByEmail: (email: string) => Promise<T | null>;
  update: (query: T) => Promise<UpdateResult>;
  delete: (query: object) => Promise<DeleteResult>;
}
