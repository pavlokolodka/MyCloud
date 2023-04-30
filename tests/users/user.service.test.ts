import mongoose from 'mongoose';
import { UserService } from '../../src/users/users.service';
import { userMock } from './mock/user.mock';
import MockUserRepository from './mock/users.repository';
import { IUser } from '../../src/users/model/users.interface';
import { IUserRepository } from '../../src/users/model/users.repository-interface';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: IUserRepository<IUser>;

  beforeEach(() => {
    mockUserRepository = new MockUserRepository();
    userService = new UserService(mockUserRepository);
  });

  describe('checkEmail', () => {
    it('should return a user object when a user with the email exists', async () => {
      const userEmail = 'johndoe@example.com';
      const result = await userService.checkEmail(userEmail);
      expect(result).toEqual<IUser>(userMock);
    });

    it('should return null when a user with the email does not exist', async () => {
      const userEmail = 'nonexistent@test.com';
      const result = await userService.checkEmail(userEmail);
      expect(result).toBeNull();
    });
  });

  describe('getUserById', () => {
    it('should return a user object when a user with the id exists', async () => {
      const userId = String(
        new mongoose.Types.ObjectId('60958c9f0000000000000000'),
      );
      const result = await userService.getUserById(userId);
      expect(result).toEqual<IUser>(userMock);
    });

    it('should return null when a user with the id does not exist', async () => {
      const userId = 'nonexistent';
      const result = await userService.getUserById(userId);
      expect(result).toBeNull();
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
      expect(result).toEqual<IUser>(userMock);
    });
  });
});
