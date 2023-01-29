import { IUser } from "./model/users.interface";
import { UserRepository } from "./model/users.repository";
import { IUserRepository } from "./model/users.repository-interface";

export class UserService {
  private userRepo: IUserRepository<IUser>;

  constructor() {
    this.userRepo = new UserRepository()
  }


  public checkEmail(email: string) {
    const user = this.userRepo.getOne({email: email});
    return user;
  }

  public create(query: IUser) {
    const user = this.userRepo.create(query);
    return user;
  } 
}