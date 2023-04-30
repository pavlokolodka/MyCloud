import { CreateUserDto } from '../dto/create-user.dto';
import { IUser } from './users.interface';
import { User } from './users.model';
import { IUserRepository } from './users.repository-interface';

export class UserRepository implements IUserRepository<IUser> {
  constructor(private database = User) {}

  public async create(query: CreateUserDto) {
    return await this.database.create(query);
  }

  public async getAll(query: object) {
    return await this.database.find(query);
  }

  public async getOne(id: string) {
    return await this.database.findOne({ _id: id });
  }

  public async getByEmail(email: string) {
    return await this.database.findOne({ email: email });
  }

  public async update(query: IUser) {
    return await this.database.updateOne(query);
  }

  public async delete(query: object) {
    return await this.database.deleteOne(query);
  }
}
