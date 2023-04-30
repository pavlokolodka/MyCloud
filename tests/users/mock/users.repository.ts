import { CreateUserDto } from '../../../src/users/dto/create-user.dto';
import { IUser } from '../../../src/users/model/users.interface';
import { IUserRepository } from '../../../src/users/model/users.repository-interface';
import { deleteResultMock, updateResultMock, userMock } from './user.mock';

export default class MockUserRepository implements IUserRepository<IUser> {
  public async create(query: CreateUserDto) {
    return userMock;
  }

  public async getAll(query: object) {
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

  public async update(query: IUser) {
    return updateResultMock;
  }

  public async delete(query: object) {
    return deleteResultMock;
  }
}
