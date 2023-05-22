import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { IUser } from './users.interface';
import { User } from './users.model';
import { IUserRepository } from './users.repository-interface';

export class UserRepository implements IUserRepository<IUser> {
  constructor(private database = User) {}

  public async create(query: CreateUserDto) {
    return await this.database.create(query);
  }

  public async getAll() {
    return await this.database.find();
  }

  public async getOne(id: string) {
    return await this.database.findOne({ _id: id });
  }

  public async getByEmail(email: string) {
    return await this.database.findOne({ email: email });
  }

  public async update(id: string, payload: UpdateUserDto) {
    return await this.database.updateOne({ _id: id }, payload);
  }

  public async delete(query: object) {
    return await this.database.deleteOne(query);
  }

  public async verify(id: string) {
    return await this.database.updateOne({ _id: id }, { isVerified: true });
  }

  public async updatePassowrd(id: string, password: string) {
    return await this.database.updateOne({ _id: id }, { password });
  }
}
