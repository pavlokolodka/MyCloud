import { CreateUserDto } from './dto/create-user.dto';
import { UpsertUserWithSocialAccountDto } from './dto/upsert-user-social.dto';
import { IUser } from './model/users.interface';
import { IUserRepository } from './model/users.repository-interface';

export class UserService {
  private userRepository: IUserRepository<IUser>;

  constructor(userRepo: IUserRepository<IUser>) {
    this.userRepository = userRepo;
  }

  public getUserByEmail(email: string) {
    const user = this.userRepository.getByEmail(email);
    return user;
  }

  public getUserById(id: string) {
    const user = this.userRepository.getOne(id);
    return user;
  }

  public getUserWithSocialAccount(payload: UpsertUserWithSocialAccountDto) {
    const user = this.userRepository.upsertByProviderId(payload);
    return user;
  }

  public create(payload: CreateUserDto) {
    const user = this.userRepository.create(payload);
    return user;
  }

  public verifyUser(id: string) {
    const user = this.userRepository.verify(id);
    return user;
  }

  public updatePassword(id: string, password: string) {
    const user = this.userRepository.updatePassoword(id, password);
    return user;
  }
}
