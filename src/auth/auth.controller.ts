import { Router, Request, Response } from "express";
import { HttpError } from "../utils/Error";
import { AuthService } from "./auth.service";
import { validationResult } from 'express-validator';
import { isValidUser, loginValidation, tokenValidation } from "../middleware/validator";
import { IRegisterUserDto } from "./dto/register.dto";
import { ILoginDto } from "./dto/login.dto";
import { IRefreshTokenDto } from "./dto/refresh-token.dto";


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
 
  constructor() {
    this.authService = new AuthService();
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
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ILoginDto'
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
     *       404:
     *         description: User not found.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HttpError'
     *             examples:
     *               overrides:
     *                 value:
     *                   status: 404
     *                   error: User with email ${email} doesn't exist
     *       422:
     *         description: Incorrect user password.
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
    this.router.post(`${this.path}/login`, loginValidation, async (req: Request, res: Response) => {
      try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
          throw new HttpError(`${errors.array()[0].msg}`, 400);
        }

        const {email, password}: ILoginDto = req.body;  
        const newUser = await this.authService.login(email, password);

        return res.send(newUser);
      } catch (e) {
        if (!(e instanceof HttpError)) return res.status(500).send('Internal server error');
        return res.status(e.status).send({message: e.message, status: e.status});
      }
    })

    /**
     * @swagger
     * /auth/register:
     *   post:
     *     summary: Register a new user
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       description: The request body for creating a new user type of IRegisterUserDto. 
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/IRegisterUserDto'
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
    this.router.post(`${this.path}/register`, isValidUser, async (req: Request, res: Response) => {
      try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
          throw new HttpError(`${errors.array()[0].msg}`, 400);
        }

        const {name, email, password}: IRegisterUserDto = req.body;  
    
        const newUser = await this.authService.register(name, email, password);

        return res.send(newUser);
      } catch (e) {
        if (!(e instanceof HttpError)) return res.status(500).send('Internal server error');
        return res.status(e.status).send({message: e.message, status: e.status});
      }
    })

    /**
     * @swagger
     * /auth/refresh-tokens:
     *   post:
     *     summary: Refresh access and refresh tokens.
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       description: The request body for refreshing access and refresh tokens type of IRefreshTokenDto. 
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/IRefreshTokenDto'
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
    this.router.post(`${this.path}/refresh-tokens`, tokenValidation, async (req: Request, res: Response) => {
      try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
          throw new HttpError(`${errors.array()[0].msg}`, 400);
        }

        const {refreshToken}: IRefreshTokenDto = req.body;
        const refreshTokens = this.authService.refreshTokens(refreshToken);

        return res.send(refreshTokens);
      } catch (error) {
        if (!(error instanceof HttpError)) return res.status(500).send('Internal server error');
        
        return res.set('WWW-Authenticate', 'Bearer').status(error.status).send({message: error.message, status: error.status});
      }
    })
  }
}