import { NextFunction, Request, Response } from 'express';
import logger from '../utils/logger';

export function loggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { method, originalUrl, ip } = req;
  logger.info(`${method} ${originalUrl} - IP: ${ip}`);
  next();
}
