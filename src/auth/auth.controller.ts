import { Router, Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { HttpError } from '../utils/Error';
import { AuthService } from './auth.service';
import {
  emailValidation,
  isValidUser,
  loginValidation,
  passwordResetValidation,
  refreshTokenValidation,
  verificationTokenValidation,
} from '../middleware/validators/validator';
import { UserService } from '../users/users.service';
import {
  IEmailTokenBody,
  ILoginBody,
  IPasswordRecoveryBody,
  IPasswordResetBody,
  IRefreshTokensBody,
  IRegisterBody,
  IVerificationTokenBody,
} from '../middleware/validators/types';
import { extractUserId } from '../middleware/auth';
import { prepareValidationErrorMessage } from '../utils/validation-error';

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API for managing user`s access control
 */
export class AuthController {
  private path = '/auth';
  public router = Router();
  private authService: AuthService;
  private userService: UserService;

  constructor(authService: AuthService, userService: UserService) {
    this.userService = userService;
    this.authService = authService;
    this.intializeRoutes();
  }

  public intializeRoutes() {
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
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const errors = validationResult(req);

          if (!errors.isEmpty()) {
            throw new HttpError(
              prepareValidationErrorMessage(errors.array()),
              400,
            );
          }

          const { email, password }: ILoginBody = req.body;
          const candidate = await this.userService.getUserByEmail(email);

          if (!candidate)
            throw new HttpError('Incorrect email or password', 422);

          const singInUser = await this.authService.login({
            password,
            userPassword: candidate.password,
            userName: candidate.name,
            userId: candidate._id,
            email,
            isVerified: candidate.isVerified,
          });

          return res.send(singInUser);
        } catch (e: unknown) {
          next(e);
        }
      },
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
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const errors = validationResult(req);

          if (!errors.isEmpty()) {
            throw new HttpError(
              prepareValidationErrorMessage(errors.array()),
              400,
            );
          }

          const { name, email, password }: IRegisterBody = req.body;

          const candidate = await this.userService.getUserByEmail(email);

          if (candidate) {
            throw new HttpError(`User with email ${email} aready exist`, 409);
          }

          const newUser = await this.authService.register({
            name,
            email,
            password,
          });

          return res.send(newUser);
        } catch (e: unknown) {
          next(e);
        }
      },
    );

    /**
     * @swagger
     * /auth/refresh-tokens:
     *   post:
     *     summary: Refresh access and refresh tokens.
     *     tags: [Auth]
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
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const errors = validationResult(req);

          if (!errors.isEmpty()) {
            throw new HttpError(
              prepareValidationErrorMessage(errors.array()),
              400,
            );
          }

          const { refreshToken }: IRefreshTokensBody = req.body;
          const refreshTokens = this.authService.refreshTokens(refreshToken);

          return res.send(refreshTokens);
        } catch (e: unknown) {
          next(e);
        }
      },
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
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const errors = validationResult(req);

          if (!errors.isEmpty()) {
            throw new HttpError(
              prepareValidationErrorMessage(errors.array()),
              400,
            );
          }

          const { token }: IVerificationTokenBody = req.body;
          const result = await this.authService.verifyEmail(token);

          if (result.isVerified) {
            return res.send({
              success: true,
              message: 'Account is already verified',
            });
          }

          return res.send({
            success: true,
            message: 'Email address has been successfully verified',
          });
        } catch (e: unknown) {
          next(e);
        }
      },
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
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const errors = validationResult(req);

          if (!errors.isEmpty()) {
            throw new HttpError(
              prepareValidationErrorMessage(errors.array()),
              400,
            );
          }

          const { email }: IEmailTokenBody = req.body;
          const candidate = await this.userService.getUserByEmail(email);

          if (!candidate) {
            return res.send({
              success: true,
              message:
                'If a matching account was found, a link was sent to confirm the email address',
            });
          }

          if (candidate.isVerified) {
            throw new HttpError('Account is already verified', 409);
          }

          const result = await this.authService.resendEmail({
            email: candidate.email,
            name: candidate.name,
            userId: candidate._id,
          });

          return res.send(result);
        } catch (e: unknown) {
          next(e);
        }
      },
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
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const errors = validationResult(req);

          if (!errors.isEmpty()) {
            throw new HttpError(
              prepareValidationErrorMessage(errors.array()),
              400,
            );
          }

          const { email }: IPasswordRecoveryBody = req.body;
          const candidate = await this.userService.getUserByEmail(email);

          if (!candidate) {
            return res.send({
              success: true,
              message:
                'If that email address is in our database, we will send you an email to reset your password',
            });
          }

          const result = await this.authService.recoverPassword({
            email,
            userId: candidate._id,
            userName: candidate.name,
          });

          return res.send(result);
        } catch (e: unknown) {
          next(e);
        }
      },
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
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const errors = validationResult(req);

          if (!errors.isEmpty()) {
            throw new HttpError(
              prepareValidationErrorMessage(errors.array()),
              400,
            );
          }

          const { token, password }: IPasswordResetBody = req.body;

          await this.authService.resetPassword({
            token: token,
            newPassword: password,
          });

          return res.status(204).send();
        } catch (e: unknown) {
          next(e);
        }
      },
    );
  }
}
