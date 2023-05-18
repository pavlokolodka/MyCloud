import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UserService } from '../users/users.service';
import { HttpError } from '../utils/Error';
import { refreshSecretKey, secretKey } from './constants';
import { ILoginDto } from './dto/login.dto';
import { IRegisterDto } from './dto/register.dto';
import { IMailService } from '../notification-services/mail.interface';
import { generateVerificationEmail } from '../assets/email-verification';

export class AuthService {
  private userService: UserService;
  private mailService: IMailService;

  constructor(userService: UserService, mailService: IMailService) {
    this.userService = userService;
    this.mailService = mailService;
  }

  public async login(payload: ILoginDto) {
    const isEqualPassword = await bcrypt.compare(
      payload.password,
      payload.userPassword,
    );

    if (!isEqualPassword)
      throw new HttpError('Incorrect email or password', 422);

    const token = jwt.sign({ id: payload.userId }, secretKey, {
      expiresIn: '1d',
    });
    const refreshToken = jwt.sign({ id: payload.userId }, refreshSecretKey, {
      expiresIn: '2d',
    });

    const user = {
      accessToken: token,
      refreshToken: refreshToken,
      user: {
        name: payload.userName,
        id: payload.userId,
        email: payload.email,
      },
    };

    return user;
  }

  public async register(payload: IRegisterDto) {
    const hashPassword = await bcrypt.hash(payload.password, 10);

    await this.mailService.sendMail(
      payload.email,
      'MyCloud email verification',
      generateVerificationEmail(payload.email, payload.name, 1222),
    );

    return {
      success: true,
      message:
        'A link to activate your account has been emailed to the address provided',
    };
    // const user = await this.userService.create({
    //   name: payload.name,
    //   email: payload.email,
    //   password: hashPassword,
    // });
    // const token = jwt.sign({ id: user._id }, secretKey, {
    //   expiresIn: '1d',
    // });
    // const refreshToken = jwt.sign({ id: user._id }, refreshSecretKey, {
    //   expiresIn: '2d',
    // });

    // return {
    //   accessToken: token,
    //   refreshToken: refreshToken,
    //   user: {
    //     name: user.name,
    //     email: user.email,
    //     id: user._id,
    //   },
    // };
  }

  public refreshTokens(rawToken: string) {
    const userId = this.getPayloadFromToken(rawToken).id;

    const token = jwt.sign({ id: userId }, secretKey, { expiresIn: '1d' });
    const refreshToken = jwt.sign({ id: userId }, refreshSecretKey, {
      expiresIn: '2d',
    });

    return { accessToken: token, refreshToken };
  }

  public getPayloadFromToken(token: string) {
    try {
      const payload = jwt.verify(
        token,
        refreshSecretKey,
      ) as unknown as jwt.JwtPayload;

      return payload;
    } catch (error) {
      throw new HttpError('Invalid JWT token', 401);
    }
  }
}
