import { Router } from 'express';
import passport from 'passport';
import { extractUserId } from '../middleware/auth';
import {
  emailValidation,
  isValidUser,
  loginValidation,
  passwordResetValidation,
  refreshTokenValidation,
  verificationTokenValidation,
} from '../middleware/validators/validator';
import { AuthController } from './auth.controller';

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API for managing user`s access control
 */
class AuthRouter {
  private path = '/auth';
  private authController: AuthController;
  public router = Router();

  constructor(authController: AuthController) {
    this.authController = authController;

    this.initializeRoutes();
  }

  private initializeRoutes() {
    /**
     * @swagger
     * /auth/login:
     *   post:
     *     summary: Login a user and return access and refresh tokens.
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       description: The request body for log in type of ILoginBody.
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ILoginBody'
     *     responses:
     *       200:
     *         description: Login successful. Returns an access token, a refresh token, and user information.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 accessToken:
     *                   type: string
     *                   description: Access token for the authenticated user.
     *                 refreshToken:
     *                   type: string
     *                   description: Refresh token for the authenticated user.
     *                 user:
     *                   type: object
     *                   properties:
     *                     name:
     *                       type: string
     *                       description: Name of the authenticated user.
     *                     email:
     *                       type: string
     *                       description: Email of the authenticated user.
     *       400:
     *         description: Invalid email or password.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 400
     *                   error: validation error
     *       422:
     *         description: Incorrect email address or user password.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 422
     *                   error: Incorrect email or password
     *       500:
     *         description: Internal Server Error.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 500
     *                   error: Internal Server Error
     */
    this.router.post(
      `${this.path}/login`,
      loginValidation,
      this.authController.login,
    );

    /**
     * @swagger
     * /auth/register:
     *   post:
     *     summary: Register a new user
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       description: The request body for creating a new user type of IRegisterBody.
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/IRegisterBody'
     *     responses:
     *       200:
     *         description: Successful registration
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 accessToken:
     *                   type: string
     *                   description: Access token for the authenticated user.
     *                 refreshToken:
     *                   type: string
     *                   description: Refresh token for the authenticated user.
     *                 user:
     *                   type: object
     *                   properties:
     *                     name:
     *                       type: string
     *                       description: Name of the authenticated user.
     *                     email:
     *                       type: string
     *                       description: Email of the authenticated user.
     *       400:
     *         description: Bad Request
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 400
     *                   error: Validation error
     *       409:
     *         description: Conflict
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 409
     *                   error: User with email ${email} aready exist
     *       500:
     *         description: Internal Server Error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 500
     *                   error: Internal server error
     */
    this.router.post(
      `${this.path}/register`,
      isValidUser,
      this.authController.register,
    );

    /**
     * @swagger
     * /auth/refresh-tokens:
     *   post:
     *     summary: Refresh access and refresh tokens.
     *     tags: [Auth]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       description: The request body for refreshing access and refresh tokens type of IRefreshTokensBody.
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/IRefreshTokensBody'
     *     responses:
     *       200:
     *         description: Returns a new access and refresh token.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 accessToken:
     *                   type: string
     *                   description: Access token for the authenticated user.
     *                 refreshToken:
     *                   type: string
     *                   description: Refresh token for the authenticated user.
     *       400:
     *         description: Bad Request
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 400
     *                   error: validation error
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 401
     *                   error: Invalid refresh token
     *       500:
     *         description: Internal Server Error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 500
     *                   error: Internal server error
     */
    this.router.post(
      `${this.path}/refresh-tokens`,
      extractUserId,
      refreshTokenValidation,
      this.authController.refreshTokens,
    );

    /**
     * @swagger
     * /auth/verification/email:
     *   post:
     *     summary: Verify email address.
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       description: The request body for verifying email address type of IVerificationTokenBody.
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/IVerificationTokenBody'
     *     responses:
     *       200:
     *         description: Indicates that the verification was successful. If the user's email has already been verified, a suitable message will be returned
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   description: Operation indicator.
     *                 message:
     *                   type: string
     *                   description: Message describing the status of the verification.
     *       400:
     *         description: Bad Request
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 400
     *                   error: validation error
     *       403:
     *         description: Verification token is invalid
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 403
     *                   error: Invalid verification token
     *       500:
     *         description: Internal Server Error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 500
     *                   error: Internal server error
     */
    this.router.post(
      `${this.path}/verification/email`,
      verificationTokenValidation,
      this.authController.verifyEmail,
    );

    /**
     * @swagger
     * /auth/verification/resend/email:
     *   post:
     *     summary: Resend mail for email address verification.
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       description: The request body for resending email type of IEmailTokenBody.
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/IEmailTokenBody'
     *     responses:
     *       200:
     *         description: Indicates that the operation was successful.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   description: Operation indicator.
     *                 message:
     *                   type: string
     *                   example: If a matching account was found, a link was sent to confirm the email address
     *                   description: Message describing the status of the verification.
     *       400:
     *         description: Bad Request
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 400
     *                   error: validation error
     *       409:
     *         description: Account is already verified
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 409
     *                   error: Account is already verified
     *       500:
     *         description: Internal Server Error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 500
     *                   error: Internal server error
     */
    this.router.post(
      `${this.path}/verification/resend/email`,
      emailValidation,
      this.authController.resendEmail,
    );

    /**
     * @swagger
     * /auth/password-recovery:
     *   post:
     *     summary: Send email for password recovery.
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       description: The request body for resending email type of IPasswordRecoveryBody.
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/IPasswordRecoveryBody'
     *     responses:
     *       200:
     *         description: Indicates that the operation was successful.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   description: Operation indicator.
     *                 message:
     *                   type: string
     *                   example: If that email address is in our database, we will send you an email to reset your password
     *                   description: Message describing the status of the verification.
     *       400:
     *         description: Bad Request
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 400
     *                   error: validation error
     *       500:
     *         description: Internal Server Error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 500
     *                   error: Internal server error
     */
    this.router.post(
      `${this.path}/password-recovery`,
      emailValidation,
      this.authController.recoverPassword,
    );

    /**
     * @swagger
     * /auth/password-reset:
     *   post:
     *     summary: Change the password.
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       description: The request body for resending email type of IPasswordResetBody.
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/IPasswordResetBody'
     *     responses:
     *       204:
     *         description: The password change was successful.
     *       400:
     *         description: Bad Request
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 400
     *                   error: validation error
     *       403:
     *         description: Verification token is invalid
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 403
     *                   error: Invalid verification token
     *       409:
     *         description: The new password matches the existing password
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 409
     *                   error: User password should be different from an old password
     *       500:
     *         description: Internal Server Error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 500
     *                   error: Internal server error
     */
    this.router.post(
      `${this.path}/password-reset`,
      passwordResetValidation,
      this.authController.resetPassword,
    );

    /**
     * @swagger
     * /auth/login/google:
     *   get:
     *     summary: Login with Google.
     *     tags: [Auth]
     *     responses:
     *       200:
     *         description: Login successful. Returns an access token, a refresh token, and user information.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 accessToken:
     *                   type: string
     *                   description: Access token for the authenticated user.
     *                 refreshToken:
     *                   type: string
     *                   description: Refresh token for the authenticated user.
     *                 user:
     *                   type: object
     *                   properties:
     *                     name:
     *                       type: string
     *                       description: Name of the authenticated user.
     *                     email:
     *                       type: string
     *                       description: Email of the authenticated user.
     *       500:
     *         description: Internal Server Error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 500
     *                   error: Internal server error
     */
    this.router.get(
      `${this.path}/login/google`,
      this.authController.googleLogin,
    );

    /**
     * @swagger
     * /auth/login/facebook:
     *   get:
     *     summary: Login with Facebook.
     *     tags: [Auth]
     *     responses:
     *       200:
     *         description: Login successful. Returns an access token, a refresh token, and user information.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 accessToken:
     *                   type: string
     *                   description: Access token for the authenticated user.
     *                 refreshToken:
     *                   type: string
     *                   description: Refresh token for the authenticated user.
     *                 user:
     *                   type: object
     *                   properties:
     *                     name:
     *                       type: string
     *                       description: Name of the authenticated user.
     *                     email:
     *                       type: string
     *                       description: Email of the authenticated user.
     *       500:
     *         description: Internal Server Error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 500
     *                   error: Internal server error
     */
    this.router.get(
      `${this.path}/login/facebook`,
      this.authController.facebookLogin,
    );

    /**
     * @swagger
     * /auth/login/linkedin:
     *   get:
     *     summary: Login with Linkedin.
     *     tags: [Auth]
     *     responses:
     *       200:
     *         description: Login successful. Returns an access token, a refresh token, and user information.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 accessToken:
     *                   type: string
     *                   description: Access token for the authenticated user.
     *                 refreshToken:
     *                   type: string
     *                   description: Refresh token for the authenticated user.
     *                 user:
     *                   type: object
     *                   properties:
     *                     name:
     *                       type: string
     *                       description: Name of the authenticated user.
     *                     email:
     *                       type: string
     *                       description: Email of the authenticated user.
     *       500:
     *         description: Internal Server Error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 500
     *                   error: Internal server error
     */
    this.router.get(
      `${this.path}/login/linkedin`,
      this.authController.linkedinLogin,
    );

    /**
     * @swagger
     * /auth/login/github:
     *   get:
     *     summary: Login with GitHub.
     *     tags: [Auth]
     *     responses:
     *       200:
     *         description: Login successful. Returns an access token, a refresh token, and user information.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 accessToken:
     *                   type: string
     *                   description: Access token for the authenticated user.
     *                 refreshToken:
     *                   type: string
     *                   description: Refresh token for the authenticated user.
     *                 user:
     *                   type: object
     *                   properties:
     *                     name:
     *                       type: string
     *                       description: Name of the authenticated user.
     *                     email:
     *                       type: string
     *                       description: Email of the authenticated user.
     *       500:
     *         description: Internal Server Error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 500
     *                   error: Internal server error
     */
    this.router.get(
      `${this.path}/login/github`,
      this.authController.githubLogin,
    );

    this.router.get(
      `${this.path}/login/twitter`,
      this.authController.twitterLogin,
    );

    /**
     * @swagger
     * /auth/google/callback:
     *   get:
     *     summary: Google callback for internal use.
     *     description: This route is for internal use only and is called by Google as a callback after successful authentication. It should not be accessed directly by casual users.
     *     tags: [Internal]
     *     security: []
     *     responses:
     *       200:
     *         description: Login successful. Returns an access token, a refresh token, and user information.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 accessToken:
     *                   type: string
     *                   description: Access token for the authenticated user.
     *                 refreshToken:
     *                   type: string
     *                   description: Refresh token for the authenticated user.
     *                 user:
     *                   type: object
     *                   properties:
     *                     name:
     *                       type: string
     *                       description: Name of the authenticated user.
     *                     email:
     *                       type: string
     *                       description: Email of the authenticated user.
     *       500:
     *         description: Internal Server Error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 500
     *                   error: Internal server error
     */
    this.router.get(
      `${this.path}/google/callback`,
      passport.authenticate('google', { session: false }),
      this.authController.socialAccountLogin,
    );

    /**
     * @swagger
     * /auth/facebook/callback:
     *   get:
     *     summary: Facebook callback for internal use.
     *     description: This route is for internal use only and is called by Facebook as a callback after successful authentication. It should not be accessed directly by casual users.
     *     tags: [Internal]
     *     security: []
     *     responses:
     *       200:
     *         description: Login successful. Returns an access token, a refresh token, and user information.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 accessToken:
     *                   type: string
     *                   description: Access token for the authenticated user.
     *                 refreshToken:
     *                   type: string
     *                   description: Refresh token for the authenticated user.
     *                 user:
     *                   type: object
     *                   properties:
     *                     name:
     *                       type: string
     *                       description: Name of the authenticated user.
     *                     email:
     *                       type: string
     *                       description: Email of the authenticated user.
     *       500:
     *         description: Internal Server Error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 500
     *                   error: Internal server error
     */
    this.router.get(
      `${this.path}/facebook/callback`,
      passport.authenticate('facebook', { session: false }),
      this.authController.socialAccountLogin,
    );

    /**
     * @swagger
     * /auth/linkedin/callback:
     *   get:
     *     summary: Linkedin callback for internal use.
     *     description: This route is for internal use only and is called by Linkedin as a callback after successful authentication. It should not be accessed directly by casual users.
     *     tags: [Internal]
     *     security: []
     *     responses:
     *       200:
     *         description: Login successful. Returns an access token, a refresh token, and user information.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 accessToken:
     *                   type: string
     *                   description: Access token for the authenticated user.
     *                 refreshToken:
     *                   type: string
     *                   description: Refresh token for the authenticated user.
     *                 user:
     *                   type: object
     *                   properties:
     *                     name:
     *                       type: string
     *                       description: Name of the authenticated user.
     *                     email:
     *                       type: string
     *                       description: Email of the authenticated user.
     *       500:
     *         description: Internal Server Error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 500
     *                   error: Internal server error
     */
    this.router.get(
      `${this.path}/linkedin/callback`,
      passport.authenticate('linkedin', { session: false }),
      this.authController.socialAccountLogin,
    );

    /**
     * @swagger
     * /auth/github/callback:
     *   get:
     *     summary: GitHub callback for internal use.
     *     description: This route is for internal use only and is called by GitHub as a callback after successful authentication. It should not be accessed directly by casual users.
     *     tags: [Internal]
     *     security: []
     *     responses:
     *       200:
     *         description: Login successful. Returns an access token, a refresh token, and user information.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 accessToken:
     *                   type: string
     *                   description: Access token for the authenticated user.
     *                 refreshToken:
     *                   type: string
     *                   description: Refresh token for the authenticated user.
     *                 user:
     *                   type: object
     *                   properties:
     *                     name:
     *                       type: string
     *                       description: Name of the authenticated user.
     *                     email:
     *                       type: string
     *                       description: Email of the authenticated user.
     *       500:
     *         description: Internal Server Error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 500
     *                   error: Internal server error
     */
    this.router.get(
      `${this.path}/github/callback`,
      passport.authenticate('github', { session: false }),
      this.authController.socialAccountLogin,
    );
    this.router.get(
      `${this.path}/twitter/callback`,
      passport.authenticate('twitter', { session: false }), // the sessions is needed to support Twitter login strategy
      this.authController.socialAccountLogin,
    );
  }
}

export default AuthRouter;
