import bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { UserService } from '../../src/users/users.service';
import { AuthService } from '../../src/auth/auth.service';
import { ILoginDto } from '../../src/auth/dto/login.dto';
import {
  authenticationResultShape,
  createAccessToken,
  createRefreshToken,
  registerResultShape,
  testHash,
  testJWTPayload,
  testJWTToken,
  verifyEmailResultShape,
} from './mock/auth.mock';
import { IRegisterDto } from '../../src/auth/dto/register.dto';
import MockUserService from '../users/mock/user.service.mock';
import MailServiceMock from '../mock/mail.service';
import { IMailService } from '../../src/notification-services/mail.interface';
import * as tokenUtils from '../../src/utils/token';
import { HttpError } from '../../src/utils/Error';
import { RegistrationType } from '../../src/users/model/users.interface';

jest.mock('bcrypt', () => ({
  compare: jest.fn((pass1, pass2) => pass1 === pass2),
  hash: jest.fn(() => testHash),
}));

jest.mock('../../src/utils/token', () => {
  return {
    __esModule: true,
    verifyJWTToken: jest.fn(() => Promise.resolve(testJWTPayload)),
    verifyRefreshToken: jest.fn(() => Promise.resolve(testJWTPayload)),
    generateJWTToken: jest.fn(() => Promise.resolve(testJWTToken)),
    generateTokens: jest.fn(() =>
      Promise.resolve({
        accessToken: testJWTToken,
        refreshToken: testJWTToken,
      }),
    ),
  };
});

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserService: UserService;
  let mockMailService: IMailService;

  beforeEach(() => {
    mockUserService = MockUserService as unknown as UserService;
    mockMailService = new MailServiceMock();
    authService = new AuthService(mockUserService, mockMailService);
  });

  describe('login', () => {
    it('should throw an error if the password is incorrect', async () => {
      const email = 'test@example.com';
      const password = 'password';
      const userPassword = 'incorrect_password';

      const payload: ILoginDto = {
        email,
        password,
        userPassword,
        userName: 'Test User',
        userId: new Types.ObjectId(),
        isVerified: true,
      };

      await expect(authService.login(payload)).rejects.toThrow(
        'Incorrect email or password',
      );
    });

    it('should throw an error if the email is not verified', async () => {
      const email = 'test@example.com';
      const password = 'password';
      const userPassword = 'password';

      const payload: ILoginDto = {
        email,
        password,
        userPassword,
        userName: 'Test User',
        userId: new Types.ObjectId(),
        isVerified: false,
      };

      await expect(authService.login(payload)).rejects.toThrow(
        'User account is not verified',
      );
    });

    it('should return an access token and refresh token if the password is correct', async () => {
      const email = 'test@example.com';
      const password = 'password';
      const userPassword = 'password';

      const payload: ILoginDto = {
        email,
        password,
        userPassword,
        userName: 'Test User',
        userId: new Types.ObjectId(),
        isVerified: true,
      };

      const result = await authService.login(payload);

      expect(result).toMatchObject(authenticationResultShape);
      expect(result.user.email).toBe(email);
      expect(result.user.id).toBe(payload.userId);
      expect(result.user.name).toBe(payload.userName);
      expect(result.accessToken).toBe(testJWTToken);
      expect(result.refreshToken).toBe(testJWTToken);
    });
  });

  describe('register', () => {
    it('should return a success result of registering', async () => {
      const payload: IRegisterDto = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password',
      };

      const result = await authService.register(payload);

      expect(result).toMatchObject(registerResultShape);
      expect(result.success).toBe(true);
      expect(result.message).toBe(
        'A link to activate your account has been emailed to the address provided',
      );
    });
  });

  describe('refreshTokens', () => {
    it('should return new tokens by refresh token', async () => {
      const mockRefreshToken = createRefreshToken('some-id');
      const result = await authService.refreshTokens(mockRefreshToken);

      expect(result.accessToken).toBe(testJWTToken);
      expect(result.refreshToken).toBe(testJWTToken);
    });

    it('should throw "Invalid JWT token" when any jwt error occurred', () => {
      const mockRefreshToken = createRefreshToken('some-id');

      jest
        .spyOn(tokenUtils, 'verifyRefreshToken')
        .mockImplementationOnce(() => {
          return Promise.reject(new HttpError('Invalid JWT token', 401));
        });

      expect(() => authService.refreshTokens(mockRefreshToken)).rejects.toThrow(
        'Invalid JWT token',
      );
    });
  });

  describe('verifyEmail', () => {
    it('should return isVerified = true, when user already verified email address before that', async () => {
      const mockToken = createAccessToken(
        String(new Types.ObjectId('60958c9f0000000000000000')),
      );

      jest
        .spyOn(tokenUtils, 'verifyJWTToken')
        .mockImplementationOnce(async () => {
          return { id: String(new Types.ObjectId('60958c9f0000000000000000')) };
        });

      const result = await authService.verifyEmail(mockToken);

      expect(result).toMatchObject(verifyEmailResultShape);
      expect(result.success).toBe(true);
      expect(result.isVerified).toBe(true);
    });

    it('should return isVerified = false, when user is not verified email address before that', async () => {
      const mockToken = createAccessToken(
        String(new Types.ObjectId('60958c9f0000000000000000')),
      );

      jest.spyOn(mockUserService, 'getUserById').mockImplementationOnce(() => {
        return Promise.resolve({
          _id: new Types.ObjectId('60958c9f0000000000000000'),
          name: 'Test User',
          email: 'test@test.com',
          password:
            '$2b$10$C/gvB8dAxPpbljhXes0b5uGv5Hxaj5C5EL5GYQg.xttxJ1tQh88t6',
          isVerified: false,
          registrationMethod: RegistrationType.Email,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      const result = await authService.verifyEmail(mockToken);

      expect(result).toMatchObject(verifyEmailResultShape);
      expect(result.success).toBe(true);
      expect(result.isVerified).toBe(false);
    });

    it('should thrown an error when token is not valid', async () => {
      const mockToken = createAccessToken(
        String(new Types.ObjectId('60958c9f0000000000000000')),
      );

      jest.spyOn(tokenUtils, 'verifyJWTToken').mockImplementationOnce(() => {
        return Promise.reject(new HttpError('Invalid verification token', 403));
      });
      expect(() => authService.verifyEmail(mockToken)).rejects.toThrow(
        'Invalid verification token',
      );
    });

    it('should thrown an error when token is not valid (user not exist)', async () => {
      const mockToken = createAccessToken(
        String(new Types.ObjectId('60958c9f0000000000000000')),
      );

      jest.spyOn(tokenUtils, 'verifyJWTToken').mockImplementationOnce(() => {
        return Promise.reject(new HttpError('Invalid verification token', 403));
      });

      expect(() => authService.verifyEmail(mockToken)).rejects.toThrow(
        'Invalid verification token',
      );
    });
  });

  describe('resendEmail', () => {
    it('should resend email', async () => {
      const result = await authService.resendEmail({
        userId: new Types.ObjectId(),
        email: 'test@example.com',
        name: 'John',
      });

      expect(result).toMatchObject(registerResultShape);
      expect(result.success).toBe(true);
      expect(result.message).toBe(
        'If a matching account was found, a link was sent to confirm the email address',
      );
    });
  });

  describe('recoverPassword', () => {
    it('should send email to recover the password', async () => {
      const result = await authService.recoverPassword({
        userId: new Types.ObjectId(),
        email: 'test@example.com',
        userName: 'John',
      });

      expect(result).toMatchObject(registerResultShape);
      expect(result.success).toBe(true);
      expect(result.message).toBe(
        'If that email address is in our database, we will send you an email to reset your password',
      );
    });
  });

  describe('resetPassword', () => {
    it('should send email to recover the password', async () => {
      const mockToken = createAccessToken(
        String(new Types.ObjectId('60958c9f0000000000000000')),
      );
      jest
        .spyOn(tokenUtils, 'verifyJWTToken')
        .mockImplementationOnce(async () => {
          return { id: String(new Types.ObjectId('60958c9f0000000000000000')) };
        });

      const result = await authService.resetPassword({
        token: mockToken,
        newPassword: 'newpassowrd12312',
      });

      expect(result).toBeUndefined();
    });

    it('should throw an error when token is not valid', async () => {
      jest.spyOn(tokenUtils, 'verifyJWTToken').mockImplementationOnce(() => {
        return Promise.reject(new HttpError('Invalid verification token', 403));
      });

      expect(() =>
        authService.resetPassword({
          token: 'invalid_token',
          newPassword: 'newpassowrd12312',
        }),
      ).rejects.toThrow('Invalid verification token');
    });

    it('should throw an error when user new password is equal to an old one', async () => {
      const mockToken = createAccessToken(
        String(new Types.ObjectId('60958c9f0000000000000000')),
      );
      jest
        .spyOn(tokenUtils, 'verifyJWTToken')
        .mockImplementationOnce(async () => {
          return { id: String(new Types.ObjectId('60958c9f0000000000000000')) };
        });
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementationOnce(() => Promise.resolve(true));

      expect(() =>
        authService.resetPassword({
          token: mockToken,
          newPassword: 'new_password',
        }),
      ).rejects.toThrow(
        'User password should be different from an old password',
      );
    });
  });
});
