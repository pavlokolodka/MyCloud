import { UserService } from "../users/users.service";
import { HttpError } from "../utils/Error";
import bcrypt from 'bcrypt';


export class AuthService {
  constructor(private userService = new UserService()) {}

  public async login(name: string, email: string, password: string) {
    const hashPassword = await bcrypt.hash(password, 10);

    const user = await this.userService.create({
      name,
      email,
      password: hashPassword
    })

    return user;
  }
}