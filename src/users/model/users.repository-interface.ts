import { UpdateResult, DeleteResult } from 'mongodb';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

export interface IUserRepository<T> {
  create: (query: CreateUserDto) => Promise<T>;
  getAll: () => Promise<T[]>;
  getOne: (id: string) => Promise<T | null>;
  getByEmail: (email: string) => Promise<T | null>;
  update: (id: string, payload: UpdateUserDto) => Promise<UpdateResult>;
  delete: (query: object) => Promise<DeleteResult>;
  verify: (id: string) => Promise<UpdateResult>;
}
