import mongoose from 'mongoose';
import { UserService } from '../../src/users/users.service';
import { userMock } from './mock/user.mock';
import MockUserRepository from './mock/users.repository';
import { IUser, RegistrationType } from '../../src/users/model/users.interface';
import { IUserRepository } from '../../src/users/model/users.repository-interface';
import { ProviderType } from '../../src/users/model/social-account.interface';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: IUserRepository<IUser>;
  const userShape: IUser = {
    _id: expect.any(mongoose.Types.ObjectId),
    name: expect.any(String),
    email: expect.any(String),
    password: expect.any(String),
    isVerified: expect.any(Boolean),
    registrationMethod: expect.stringContaining(
      RegistrationType.Email ||
        RegistrationType.Social ||
        RegistrationType.Phone,
    ),
    createdAt: expect.any(Date),
    updatedAt: expect.any(Date),
  };

  beforeAll(() => {
    mockUserRepository = new MockUserRepository();
    userService = new UserService(mockUserRepository);
  });

  describe('getUserByEmail', () => {
    it('should return a user object when a user with the email exists', async () => {
      const result = await userService.getUserByEmail(userMock.email);

      expect(result).toMatchObject<IUser>(userShape);
      expect(result).toEqual<IUser>(userMock);
    });

    it('should return null when a user with the email does not exist', async () => {
      const userEmail = 'nonexistent@test.com';
      const result = await userService.getUserByEmail(userEmail);
      expect(result).toBeNull();
    });
  });

  describe('getUserById', () => {
    it('should return a user object when a user with the id exists', async () => {
      const result = await userService.getUserById(userMock._id.toString());

      expect(result).toMatchObject<IUser>(userShape);
      expect(result).toEqual<IUser>(userMock);
    });

    it('should return null when a user with the id does not exist', async () => {
      const userId = 'nonexistent';
      const result = await userService.getUserById(userId);
      expect(result).toBeNull();
    });
  });

  describe('getUserWithSocialAccount', () => {
    it('should return a user object when it exists with the provided open id', async () => {
      const result = await userService.getUserWithSocialAccount({
        openId: '123456789',
        name: 'John Doe',
        pictureUrl: 'https://example.com/profile-picture.jpg',
        email: 'johndoe@example.com',
        provider: ProviderType.Google,
      });

      expect(result.name).toEqual('John Doe');
      expect(result.email).toEqual('johndoe@example.com');
      expect(result.isVerified).toEqual(true);
      expect(result.password).toEqual(undefined);
      expect(result.registrationMethod).toEqual(RegistrationType.Social);
    });

    it('should create a user when an open id does not exist', async () => {
      const userId = 'nonexistent';
      const result = await userService.getUserWithSocialAccount({
        openId: '123456789',
        name: 'John Doe',
        pictureUrl: 'https://example.com/profile-picture.jpg',
        email: 'johndoe@example.com',
        provider: ProviderType.Google,
      });

      expect(result.name).toEqual('John Doe');
      expect(result.email).toEqual('johndoe@example.com');
      expect(result.isVerified).toEqual(true);
      expect(result.password).toEqual(undefined);
      expect(result.registrationMethod).toEqual(RegistrationType.Social);
    });
  });

  describe('create', () => {
    it('should return a user object with the provided data', async () => {
      const userPayload = {
        name: 'Test User',
        email: 'test@test.com',
        password: 'password',
      };

      const result = await userService.create(userPayload);
      expect(result).toMatchObject<IUser>(userShape);
      expect(result.name).toEqual(userPayload.name);
      expect(result.email).toEqual(userPayload.email);
      expect(result.password).toEqual(userPayload.password);
      expect(result.registrationMethod).toEqual(RegistrationType.Email);
    });
  });
});
