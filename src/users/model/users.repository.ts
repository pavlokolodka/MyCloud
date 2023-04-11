import { HttpError } from '../../utils/Error';
import { IUser } from './users.interface';
import { User } from './users.model';
import { IUserRepository } from './users.repository-interface';

export class UserRepository implements IUserRepository<IUser> {
  constructor(private database = User) {}

  public async create(query: IUser) {
    try {
      return await this.database.create(query);
    } catch (e) {
      throw new HttpError('creation error', 500);
    }
  }

  public async getAll(query: object) {
    try {
      return await this.database.find(query);
    } catch (e) {
      throw new HttpError('can not get users', 500);
    }
  }

  public async getOne(query: object) {
    try {
      return await this.database.findOne(query);
    } catch (e) {
      throw new HttpError('can not get user', 500);
    }
  }

  public async update(query: IUser) {
    try {
      return await this.database.updateOne(query);
    } catch (e) {
      throw new HttpError('update error', 500);
    }
  }

  public async delete(query: object) {
    try {
      return await this.database.deleteOne(query);
    } catch (e) {
      throw new HttpError('deletion error', 500);
    }
  }
}
