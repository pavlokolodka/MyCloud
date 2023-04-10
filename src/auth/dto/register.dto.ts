/**
 * @swagger
 * components:
 *   schemas:
 *     IRegisterUserDto:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the user.
 *           example: John Smith
 *         email:
 *           type: string
 *           format: email
 *           description: The email of the user.
 *           example: john.smith@example.com
 *         password:
 *           type: string
 *           format: password
 *           description: The password of the user.
 *           example: password123
 */
export interface IRegisterUserDto {
  name: string;
  email: string;
  password: string;
}