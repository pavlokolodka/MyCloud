import bcrypt from 'bcrypt';
import { UserService } from '../users/users.service';
import ApplicationError from '../utils/Error';
import { ILoginDto } from './dto/login.dto';
import { IRegisterDto } from './dto/register.dto';
import { IMailService } from '../notification-services/mail.interface';
import { generateVerificationEmail } from '../assets/email-verification';
import { IResendEmail } from './dto/resend-email.dto';
import { IPasswordRecovery } from './dto/password-recovery.dto';
import { IResetPassword } from './dto/reset-password.dto';
import { generatePasswordRecovery } from '../assets/password-recovery';
import {
  generateJWTToken,
  generateTokens,
  verifyToken,
  verifyRefreshToken,
} from '../utils/token';
import { generatePasswordRecoveryNotification } from '../assets/password-recovery.infrom';
import { SocialProfileData } from '../middleware/passport/types';
import { RegistrationType } from '../users/model/users.interface';

export class AuthService {
  private userService: UserService;
  private mailService: IMailService;

  constructor(userService: UserService, mailService: IMailService) {
    this.userService = userService;
    this.mailService = mailService;
  }

  public async login(payload: ILoginDto) {
    if (!payload.isVerified) {
      throw ApplicationError.Unauthorized('User account is not verified');
    }

    const isEqualPassword = await bcrypt.compare(
      payload.password,
      payload.userPassword,
    );

    if (!isEqualPassword)
      throw ApplicationError.UnprocessableContent(
        'Incorrect email or password',
      );

    const { accessToken, refreshToken } = await generateTokens(payload.userId);

    const user = {
      accessToken,
      refreshToken,
      user: {
        name: payload.userName,
        id: payload.userId,
        email: payload.email,
      },
    };

    return user;
  }

  public async loginWithSocialAccount(payload: SocialProfileData) {
    const user = await this.userService.getUserWithSocialAccount({
      openId: payload.id,
      name: payload.name,
      email: payload.email,
      pictureUrl: payload.picture,
      provider: payload.provider,
    });
    const { accessToken, refreshToken } = await generateTokens(user._id);

    const response = {
      accessToken,
      refreshToken,
      user: {
        name: user.name,
        id: user._id,
        email: user.email,
      },
    };

    return response;
  }

  public async register(payload: IRegisterDto) {
    const hashPassword = await bcrypt.hash(payload.password, 10);
    const user = await this.userService.create({
      name: payload.name,
      email: payload.email,
      password: hashPassword,
    });
    const verificationToken = (await generateJWTToken(user._id)) as string;

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
    const payload = await verifyToken(token);

    const user = await this.userService.getUserById(payload.id);

    if (!user) {
      throw ApplicationError.Unauthorized('Invalid verification token');
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
  }

  public async resendEmail(payload: IResendEmail) {
    const verificationToken = (await generateJWTToken(
      payload.userId,
    )) as string;

    await this.mailService.sendMail(
      payload.email,
      'MyCloud email verification',
      generateVerificationEmail(payload.name, verificationToken),
    );

    return {
      success: true,
      message:
        'If a matching account was found, a link was sent to confirm the email address',
    };
  }

  public async recoverPassword(payload: IPasswordRecovery) {
    const verificationToken = (await generateJWTToken(
      payload.userId,
    )) as string;

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
    const tokenPayload = await verifyToken(payload.token);

    const user = await this.userService.getUserById(tokenPayload.id);

    if (!user) {
      throw ApplicationError.Unauthorized('Invalid verification token');
    }

    if (!user.password && user.registrationMethod === RegistrationType.Social) {
      throw ApplicationError.UnprocessableContent(
        'Password reset is not available for accounts with social login',
      );
    }

    const isEqualPasswords = await bcrypt.compare(
      payload.newPassword,
      user.password as string,
    );

    if (isEqualPasswords) {
      throw ApplicationError.Conflict(
        'User password should be different from an old password',
      );
    }

    const hashedPassword = await bcrypt.hash(payload.newPassword, 10);

    await this.userService.updatePassword(String(user._id), hashedPassword);
    await this.mailService.sendMail(
      user.email,
      'MyCloud password change notification',
      generatePasswordRecoveryNotification(user.name),
    );
  }

  public async refreshTokens(refreshJWTToken: string) {
    const userId = (await verifyRefreshToken(refreshJWTToken)).id;

    const { accessToken, refreshToken } = await generateTokens(userId);

    return { accessToken, refreshToken };
  }
}
