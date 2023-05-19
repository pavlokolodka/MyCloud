import * as jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
import { Types } from 'mongoose';
const refreshSecretKey = process.env.REFRESH_SECRET_KEY as string;
const secretKey = process.env.SECRET_KEY as string;

export const authenticationResultShape = {
  accessToken: expect.any(String),
  refreshToken: expect.any(String),
  user: {
    name: expect.any(String),
    id: expect.any(Types.ObjectId),
    email: expect.any(String),
  },
};

export const registerResultShape = {
  success: expect.any(Boolean),
  message: expect.any(String),
};

export const verifyEmailResultShape = {
  success: expect.any(Boolean),
  isVerified: expect.any(Boolean),
};

export const testJWTToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
export const testHash = 'test-hash';
export const testJWTPayload = { id: 'some-id12' };

jest.unmock('jsonwebtoken');
export const createRefreshToken = (id: string) => {
  return jwt.sign({ id }, refreshSecretKey, { expiresIn: '5m' });
};
jest.unmock('jsonwebtoken');
export const createAccessToken = (id: string) => {
  return jwt.sign({ id }, secretKey, { expiresIn: '5m' });
};
