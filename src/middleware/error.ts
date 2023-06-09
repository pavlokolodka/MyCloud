import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/Error';
import logger from '../utils/logger';

export const errorHandler = (
  error: ErrorRequestHandler,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (error instanceof HttpError) {
    if (error.status === 401) {
      res.setHeader(
        'WWW-Authenticate',
        `Bearer realm="Access to the MyCloud", error=${error.message}, error_description="The access token is invalid or expired"`,
      );
    }

    const errorMessage = { message: error.message, error };
    logger.warn(errorMessage);

    return res
      .status(error.status)
      .send({ message: error.message, status: error.status });
  }

  const errorMessage = { message: error.toString(), error };
  logger.error(errorMessage);

  res.status(500).send({ message: 'Internal Server Error', status: 500 });
};
