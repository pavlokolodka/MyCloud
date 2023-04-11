/**
 * @swagger
 * components:
 *   schemas:
 *     IRefreshTokenDto:
 *       type: object
 *       properties:
 *         refreshToken:
 *           type: string
 *           description: The refresh token used to generate a new access token.
 *       required:
 *         - refreshToken
 */
export interface IRefreshTokenDto {
  refreshToken: string;
}
