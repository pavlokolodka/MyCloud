import { CreateUserDto } from './dto/create-user.dto';
import { IUser } from './model/users.interface';
import { UserRepository } from './model/users.repository';
import { IUserRepository } from './model/users.repository-interface';

export class UserService {
  private userRepo: IUserRepository<IUser>;

  constructor() {
    this.userRepo = new UserRepository();
  }

  public checkEmail(email: string) {
    const user = this.userRepo.getOne({ email: email });
    return user;
  }

  public getUserById(id: string) {
    const user = this.userRepo.getOne({ _id: id });
    return user;
  }

  public create(payload: CreateUserDto) {
    const user = this.userRepo.create(payload);
    return user;
  }
}
