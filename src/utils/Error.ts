/**
 * @swagger
 * components:
 *   schemas:
 *     HttpError:
 *       type: object
 *       properties:
 *         status:
 *           type: integer
 *           example: 500
 *         error:
 *           type: string
 *           example: Internal Server Error
 */
export default class ApplicationError extends Error {
  constructor(public message: string, public status: number) {
    super(message);
    this.status = status;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  static BadRequest(message = 'Bad Request') {
    return new ApplicationError(message, 400);
  }

  static Unauthenticated(message = 'Unauthorized') {
    return new ApplicationError(message, 401);
  }

  static Unauthorized(message = 'Forbidden') {
    return new ApplicationError(message, 403);
  }

  static NotFound(message = 'Not Found') {
    return new ApplicationError(message, 404);
  }

  static Conflict(message = 'Conflict') {
    return new ApplicationError(message, 409);
  }

  static UnprocessableContent(message = 'Unprocessable Content') {
    return new ApplicationError(message, 422);
  }

  static InternalError(message = 'Internal Server Error') {
    return new ApplicationError(message, 500);
  }
}
