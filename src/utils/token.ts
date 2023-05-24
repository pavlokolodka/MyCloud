import * as jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { refreshSecretKey, secretKey } from '../auth/constants';
import { HttpError } from './Error';

/**
 * Verify a JWT token. Used for account verification, password recovery.
 * @param {string} token - The JWT token to verify.
 * @returns {Promise<jwt.JwtPayload>} A Promise that resolves to the decoded JWT payload if the token is valid.
 * @throws {HttpError} If the token is invalid or expired throws 403.
 */
export async function verifyJWTToken(token: string) {
  return new Promise((res, rej) => {
    jwt.verify(token, secretKey, (error, decoded) => {
      if (error) rej(new HttpError('Invalid verification token', 403));

      res(decoded);
    });
  }) as unknown as jwt.JwtPayload;
}

/**
 * Generate a JWT token. Used as a token account verification, password recovery.
 * @param {string} token - The JWT token to verify.
 * @returns {Promise<jwt.Jwt>} A Promise that resolves to the encoded JWT token.
 * @throws {Error } If the token is invalid or expired.
 */
export async function generateJWTToken(id: Types.ObjectId) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      { id },
      secretKey,
      {
        expiresIn: '30m',
      },
      (err, encoded) => {
        if (err) reject(err);

        resolve(encoded);
      },
    );
  });
}
/**
 * Verify a JWT refresh token.
 * @param {string} token - The JWT token to verify.
 * @returns {Promise<jwt.JwtPayload>} A Promise that resolves to the decoded JWT payload if the token is valid.
 * @throws {HttpError} If the token is invalid or expired throws 401.
 */
export async function verifyRefreshToken(token: string) {
  return new Promise((res, rej) => {
    jwt.verify(token, refreshSecretKey, (error, decoded) => {
      if (error) rej(new HttpError('Invalid JWT token', 401));

      res(decoded);
    });
  }) as unknown as jwt.JwtPayload;
}
/**
 * Generate a pair of JWT tokens (access and refresh). Used for basic auth.
 * @param {string} token - The JWT token to verify.
 * @returns {Promise<jwt.Jwt>} A Promise that resolves to the encoded JWT token.
 * @throws {Error } If the token is invalid or expired.
 */
export function generateTokens(id: Types.ObjectId) {
  const accessToken = new Promise<string | undefined>((resolve, reject) => {
    jwt.sign(
      { id },
      secretKey,
      {
        expiresIn: '1d',
      },
      (err, encoded) => {
        if (err) reject(err);

        resolve(encoded);
      },
    );
  });
  const refreshToken = new Promise<string | undefined>((resolve, reject) => {
    jwt.sign(
      { id },
      refreshSecretKey,
      {
        expiresIn: '2d',
      },
      (err, encoded) => {
        if (err) reject(err);

        resolve(encoded);
      },
    );
  });

  return Promise.all([accessToken, refreshToken]).then(
    ([accessToken, refreshToken]) => {
      return { accessToken, refreshToken };
    },
  );
}
