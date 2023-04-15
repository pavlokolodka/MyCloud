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
export class HttpError extends Error {
  public status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
