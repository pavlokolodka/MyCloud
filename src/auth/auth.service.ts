import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UserService } from '../users/users.service';
import { HttpError } from '../utils/Error';
import { refreshSecretKey, secretKey } from './constants';
import { ILoginDto } from './dto/login.dto';
import { IRegisterDto } from './dto/register.dto';
import { IMailService } from '../notification-services/mail.interface';
import { generateVerificationEmail } from '../assets/email-verification';
import { IResendEmail } from './dto/resend-email.dto';
import { IPasswordRecovery } from './dto/password-recovery.dto';
import { IResetPassword } from './dto/reset-password.dto';
import { generatePasswordRecovery } from '../assets/password-recovery';

export class AuthService {
  private userService: UserService;
  private mailService: IMailService;

  constructor(userService: UserService, mailService: IMailService) {
    this.userService = userService;
    this.mailService = mailService;
  }

  public async login(payload: ILoginDto) {
    if (!payload.isVerified) {
      throw new HttpError('User account is not verified', 403);
    }

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
    const user = await this.userService.create({
      name: payload.name,
      email: payload.email,
      password: hashPassword,
    });
    const verificationToken = jwt.sign({ id: user._id }, secretKey, {
      expiresIn: '30m',
    });

    await this.mailService.sendMail(
      payload.email,
      'MyCloud email verification',
      generateVerificationEmail(payload.name, verificationToken),
    );

    return {
      success: true,
      message:
        'A link to activate your account has been emailed to the address provided',
    };
  }

  public async verifyEmail(token: string) {
    try {
      const payload = jwt.verify(token, secretKey) as unknown as jwt.JwtPayload;

      const user = await this.userService.getUserById(payload.id);

      if (!user) {
        throw new HttpError('Invalid verification token', 403);
      }

      if (user.isVerified) {
        return {
          success: true,
          isVerified: true,
        };
      }

      await this.userService.verifyUser(payload.id);

      return {
        success: true,
        isVerified: false,
      };
    } catch (error) {
      throw new HttpError('Invalid verification token', 403);
    }
  }

  public async resendEmail(payload: IResendEmail) {
    const verificationToken = jwt.sign({ id: payload.userId }, secretKey, {
      expiresIn: '30m',
    });

    await this.mailService.sendMail(
      payload.email,
      'MyCloud email verification',
      generateVerificationEmail(payload.name, verificationToken),
    );

    return {
      success: true,
      message:
        'A link to activate your account has been emailed to the address provided',
    };
  }

  public refreshTokens(rawToken: string) {
    const userId = this.getPayloadFromToken(rawToken).id;

    const token = jwt.sign({ id: userId }, secretKey, { expiresIn: '1d' });
    const refreshToken = jwt.sign({ id: userId }, refreshSecretKey, {
      expiresIn: '2d',
    });

    return { accessToken: token, refreshToken };
  }

  public async recoverPassword(payload: IPasswordRecovery) {
    const verificationToken = jwt.sign({ id: payload.userId }, secretKey, {
      expiresIn: '30m',
    });

    await this.mailService.sendMail(
      payload.email,
      'MyCloud password recovery',
      generatePasswordRecovery(payload.userName, verificationToken),
    );

    return {
      success: true,
      message:
        'If that email address is in our database, we will send you an email to reset your password',
    };
  }

  public async resetPassword(payload: IResetPassword) {
    try {
      const tokenPayload = jwt.verify(
        payload.token,
        secretKey,
      ) as unknown as jwt.JwtPayload;

      const user = await this.userService.getUserById(tokenPayload.id);

      if (!user) {
        throw new HttpError('Invalid verification token', 403);
      }

      if (user.password === payload.newPassword) {
        throw new HttpError(
          'User password should be different from an old password',
          409,
        );
      }
    } catch (error) {
      throw new HttpError('Invalid verification token', 403);
    }
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
