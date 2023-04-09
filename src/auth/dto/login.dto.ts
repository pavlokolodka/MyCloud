/**
 * @swagger
 * components:
 *   schemas:
 *     ILoginDto:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: The user's email address.
 *         password:
 *           type: string
 *           description: The user's password.
 *       required:
 *         - email
 *         - password
 */
export interface ILoginDto {
  email: string;
  password: string;
}