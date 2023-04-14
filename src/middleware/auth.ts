import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { HttpError } from '../utils/Error';
import { secretKey } from '../auth/constants';

export function extractUserEmail(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const rawToken = req.headers['authorization'];

  if (!rawToken) {
    return next(new HttpError('Authorization token is required', 401));
  }

  const [bearer, token] = rawToken.split(' ');

  if (!bearer || bearer !== 'Bearer') {
    next(new HttpError('Invalid token format', 401));
  }

  if (!token) {
    next(new HttpError('Invalid auth token', 401));
  }

  try {
    const payload = jwt.verify(token, secretKey) as unknown as jwt.JwtPayload;

    req.user = { email: payload.email };
    next();
  } catch (error) {
    next(new HttpError('Invalid JWT token', 401));
  }
}
