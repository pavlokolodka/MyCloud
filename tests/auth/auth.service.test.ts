import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { UserService } from '../../src/users/users.service';
import { AuthService } from '../../src/auth/auth.service';
import { ILoginDto } from '../../src/auth/dto/login.dto';
import {
  authenticationResultShape,
  createRefreshToken,
  testHash,
  testJWTPayload,
  testJWTToken,
} from './mock/auth.mock';
import { IRegisterDto } from '../../src/auth/dto/register.dto';
import MockUserService from '../users/mock/user.service.mock';

jest.mock('bcrypt', () => ({
  compare: jest.fn((pass1, pass2) => pass1 === pass2),
  hash: jest.fn(() => testHash),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => testJWTToken),
  verify: jest.fn(() => testJWTPayload),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserService: UserService;

  beforeEach(() => {
    mockUserService = MockUserService as unknown as UserService;

    authService = new AuthService(mockUserService);
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
      };

      await expect(authService.login(payload)).rejects.toThrow(
        'Incorrect email or password',
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
    it('should return a new user with tokens', async () => {
      const payload: IRegisterDto = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password',
      };

      const result = await authService.register(payload);

      expect(result).toMatchObject(authenticationResultShape);
      expect(result.user.email).toBe(payload.email);
      expect(result.user.id).toStrictEqual(expect.any(Types.ObjectId));
      expect(result.user.name).toBe(payload.name);
      expect(result.accessToken).toBe(testJWTToken);
      expect(result.refreshToken).toBe(testJWTToken);
    });
  });

  describe('refreshTokens', () => {
    it('should return new tokens by refresh token', () => {
      const mockRefreshToken = createRefreshToken('some-id');
      const result = authService.refreshTokens(mockRefreshToken);

      expect(result.accessToken).toBe(testJWTToken);
      expect(result.refreshToken).toBe(testJWTToken);
    });

    it('should throw "Invalid JWT token" when any jwt error occurred', () => {
      const mockRefreshToken = createRefreshToken('some-id');

      jest.spyOn(jwt, 'verify').mockImplementationOnce(() => {
        throw new Error('jwt error');
      });

      expect(() => authService.refreshTokens(mockRefreshToken)).toThrow(
        'Invalid JWT token',
      );
    });
  });

  describe('getPayloadFromToken', () => {
    it('should return new tokens by refresh token', () => {
      const mockRefreshToken = createRefreshToken('some-id');
      const result = authService.getPayloadFromToken(mockRefreshToken);

      expect(result).toBeDefined();
      expect(result).toMatchObject(testJWTPayload);
    });

    it('should throw "Invalid JWT token" when any jwt error occurred', () => {
      const mockRefreshToken = createRefreshToken('some-id');

      jest.spyOn(jwt, 'verify').mockImplementationOnce(() => {
        throw new Error('jwt error');
      });

      expect(() => authService.getPayloadFromToken(mockRefreshToken)).toThrow(
        'Invalid JWT token',
      );
    });
  });
});
