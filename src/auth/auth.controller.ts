import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import passport from 'passport';
import ApplicationError from '../utils/Error';
import { AuthService } from './auth.service';
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
import { prepareValidationErrorMessage } from '../utils/validation-error';
import { SocialProfileData } from '../middleware/passport/types';
import { RegistrationType } from '../users/model/users.interface';

export class AuthController {
  private authService: AuthService;
  private userService: UserService;

  constructor(authService: AuthService, userService: UserService) {
    this.userService = userService;
    this.authService = authService;
  }

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        throw ApplicationError.BadRequest(
          prepareValidationErrorMessage(errors.array()),
        );
      }

      const { email, password }: ILoginBody = req.body;
      const candidate = await this.userService.getUserByEmail(email);

      if (!candidate)
        throw ApplicationError.UnprocessableContent(
          'Incorrect email or password',
        );

      if (
        !candidate.password &&
        candidate.registrationMethod === RegistrationType.Social
      ) {
        throw ApplicationError.Conflict(
          'This email is already registered with a social account',
        );
      }

      const authenticatedUser = await this.authService.login({
        password,
        userPassword: candidate.password as string,
        userName: candidate.name,
        userId: candidate._id,
        email,
        isVerified: candidate.isVerified,
      });

      return res.send(authenticatedUser);
    } catch (e: unknown) {
      next(e);
    }
  };

  public register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        throw ApplicationError.BadRequest(
          prepareValidationErrorMessage(errors.array()),
        );
      }

      const { name, email, password }: IRegisterBody = req.body;

      const candidate = await this.userService.getUserByEmail(email);

      if (candidate) {
        throw ApplicationError.Conflict(
          `User with email ${email} aready exist`,
        );
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
  };

  public refreshTokens = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        throw ApplicationError.BadRequest(
          prepareValidationErrorMessage(errors.array()),
        );
      }

      const { refreshToken }: IRefreshTokensBody = req.body;
      const refreshTokens = this.authService.refreshTokens(refreshToken);

      return res.send(refreshTokens);
    } catch (e: unknown) {
      next(e);
    }
  };
  public verifyEmail = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        throw ApplicationError.BadRequest(
          prepareValidationErrorMessage(errors.array()),
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
  };
  public resendEmail = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        throw ApplicationError.BadRequest(
          prepareValidationErrorMessage(errors.array()),
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
        throw ApplicationError.Conflict('Account is already verified');
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
  };

  public recoverPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        throw ApplicationError.BadRequest(
          prepareValidationErrorMessage(errors.array()),
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
  };

  public resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        throw ApplicationError.BadRequest(
          prepareValidationErrorMessage(errors.array()),
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
  };

  public google = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return passport.authenticate('google')(req, res, next);
    } catch (e: unknown) {
      next(e);
    }
  };

  public facebook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return passport.authenticate('facebook')(req, res, next);
    } catch (e: unknown) {
      next(e);
    }
  };

  public linkedin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return passport.authenticate('linkedin')(req, res, next);
    } catch (e: unknown) {
      next(e);
    }
  };

  public github = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return passport.authenticate('github')(req, res, next);
    } catch (e: unknown) {
      next(e);
    }
  };

  public socialAccountLogin = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const socialUser = req.user as unknown as SocialProfileData;
      const authenticatedUser = await this.authService.loginWithSocialAccount(
        socialUser,
      );

      res.send(authenticatedUser);
    } catch (e: unknown) {
      next(e);
    }
  };
}
