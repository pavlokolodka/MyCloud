/**
 * @swagger
 * components:
 *   schemas:
 *     ILoginBody:
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
export interface ILoginBody {
  email: string;
  password: string;
}
