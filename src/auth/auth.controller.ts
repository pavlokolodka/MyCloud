import { Router, Request, Response } from "express";
import { HttpError } from "../utils/Error";
import { AuthService } from "./auth.service";
import { validationResult } from 'express-validator';
import { isValidUser, loginValidation, tokenValidation } from "../middleware/validator";
import { IRegisterUserDto } from "./dto/register.dto";
import { ILoginDto } from "./dto/login.dto";



export class AuthController {
  private path = '/auth';
  public router = Router();
  private authService: AuthService;
 
  constructor() {
    this.authService = new AuthService();
    this.intializeRoutes();
  }

  public intializeRoutes() {
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

    this.router.post(`${this.path}/refresh-tokens`, tokenValidation, async (req: Request, res: Response) => {
      try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
          throw new HttpError(`${errors.array()[0].msg}`, 400);
        }

        const {refreshToken} = req.body;
        const refreshTokens = this.authService.refreshTokens(refreshToken);

        return res.send(refreshTokens);
      } catch (error) {
        if (!(error instanceof HttpError)) return res.status(500).send('Internal server error');
        
        return res.set('WWW-Authenticate', 'Bearer').status(error.status).send({message: error.message, status: error.status});
      }
    })
  }
}