import { Types } from 'mongoose';
import { CreateUserDto } from '../../../src/users/dto/create-user.dto';

class MockUserService {
  getUserByEmail(email: string) {
    return Promise.resolve({
      _id: new Types.ObjectId(),
      name: 'Test User',
      email: email,
      password: '$2b$10$C/gvB8dAxPpbljhXes0b5uGv5Hxaj5C5EL5GYQg.xttxJ1tQh88t6',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  getUserById(id: string) {
    return Promise.resolve({
      _id: new Types.ObjectId(id),
      name: 'Test User',
      email: 'test@test.com',
      password: '$2b$10$C/gvB8dAxPpbljhXes0b5uGv5Hxaj5C5EL5GYQg.xttxJ1tQh88t6',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  create(payload: CreateUserDto) {
    return Promise.resolve({
      _id: new Types.ObjectId(),
      name: payload.name,
      email: payload.email,
      password: payload.password,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

export default new MockUserService();
