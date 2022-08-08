import { UserService } from "../users/users.service";
import bcrypt from 'bcrypt';
import { HttpError } from "../utils/Error";


export class AuthService {
  constructor(private userService = new UserService()) {}

  public async login(email: string, password: string) {
    const candidate = await this.userService.checkEmail(email);

    if (!candidate) throw new HttpError(`user with email ${email} doesn't exist`, 404)

    const isEqualPassword = await bcrypt.compare(password, candidate.password)

    if (!isEqualPassword) throw new HttpError('wrong password', 400);

    const user = {
      id: candidate._id,
      name: candidate.name,
      email: candidate.email,
      files: candidate.files,
    }
    return user;
  }

  public async register(name: string, email: string, password: string) {
    const hashPassword = await bcrypt.hash(password, 10);

    const user = await this.userService.create({
      name,
      email,
      password: hashPassword
    })

    return user;
  }
}