import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import ApplicationError from '../utils/Error';
import { secretKey } from '../auth/constants';
import { verifyAccessToken } from '../utils/token';

export async function extractUserId(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const rawToken = req.headers['authorization'];

  if (!rawToken) {
    return next(
      ApplicationError.Unauthenticated('Authorization token is required'),
    );
  }

  const [bearer, token] = rawToken.split(' ');

  if (!bearer || bearer !== 'Bearer') {
    next(ApplicationError.Unauthenticated('Invalid token format'));
  }

  if (!token) {
    next(ApplicationError.Unauthenticated('Invalid auth token'));
  }

  try {
    const payload = await verifyAccessToken(token);

    req.user = { id: payload.id };
    next();
  } catch (error) {
    next(ApplicationError.Unauthenticated('Invalid JWT token'));
  }
}
