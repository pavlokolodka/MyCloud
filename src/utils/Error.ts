/**
 * @swagger
 * components:
 *   schemas:
 *     HttpError:
 *       type: object
 *       properties:
 *         status:
 *           type: integer
 *         error:
 *           type: string
 */
export class HttpError extends Error {
  public status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}