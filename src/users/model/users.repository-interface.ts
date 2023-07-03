import { UpdateResult, DeleteResult } from 'mongodb';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UpsertUserWithSocialAccountDto } from '../dto/upsert-user-social.dto';

export interface IUserRepository<T> {
  create: (query: CreateUserDto) => Promise<T>;
  getAll: () => Promise<T[]>;
  getOne: (id: string) => Promise<T | null>;
  upsertByProviderId: (query: UpsertUserWithSocialAccountDto) => Promise<T>;
  getByEmail: (email: string) => Promise<T | null>;
  update: (id: string, payload: UpdateUserDto) => Promise<UpdateResult>;
  delete: (query: object) => Promise<DeleteResult>;
  verify: (id: string) => Promise<UpdateResult>;
  updatePassoword: (id: string, password: string) => Promise<UpdateResult>;
}
