import mongoose from 'mongoose';
import { CreateUserDto } from '../../../src/users/dto/create-user.dto';
import {
  IUser,
  RegistrationType,
} from '../../../src/users/model/users.interface';
import { IUserRepository } from '../../../src/users/model/users.repository-interface';
import { deleteResultMock, updateResultMock, userMock } from './user.mock';
import { UpdateUserDto } from '../../../src/users/dto/update-user.dto';
import { UpsertUserWithSocialAccountDto } from '../../../src/users/dto/upsert-user-social.dto';

export default class MockUserRepository implements IUserRepository<IUser> {
  public async create(query: CreateUserDto) {
    const userMock: IUser = {
      _id: new mongoose.Types.ObjectId('6135ae5a40fbb50443d26a5f'),
      name: query.name,
      email: query.email,
      password: query.password,
      isVerified: false,
      registrationMethod: RegistrationType.Email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return userMock;
  }

  public async upsertByProviderId(query: UpsertUserWithSocialAccountDto) {
    const userMock: IUser = {
      _id: new mongoose.Types.ObjectId('6135ae5a40fbb50443d26a5f'),
      name: query.name,
      email: query.email,
      isVerified: true,
      registrationMethod: RegistrationType.Social,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return userMock;
  }

  public async getAll() {
    return [userMock];
  }

  public async getOne(id: string) {
    if (id === String(userMock._id)) return userMock;
    return null;
  }

  public async getByEmail(email: string) {
    if (email === userMock.email) return userMock;
    return null;
  }

  public async update(id: string, payload: UpdateUserDto) {
    return updateResultMock;
  }

  public async verify(id: string) {
    return updateResultMock;
  }

  public async updatePassoword(id: string, password: string) {
    return updateResultMock;
  }

  public async delete(query: object) {
    return deleteResultMock;
  }
}
