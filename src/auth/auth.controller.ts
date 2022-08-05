import { Router, Request, Response } from "express";
import { HttpError } from "../utils/Error";
import { AuthService } from "./auth.service";
import { validationResult } from 'express-validator';
import { isValidUser } from "../middleware/validator";
import { ICreateUserDto } from "./dto/create-user.dto";



export class AuthController {
  private path = '/auth';
  public router = Router();
  private authService: AuthService;
 
  constructor() {
    this.authService = new AuthService();
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.post(`${this.path}/login`, isValidUser, async (req: Request, res: Response) => {
      try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
          throw new HttpError(`${errors.array()[0].msg}`, 400);
        }

        const {name, email, password}: ICreateUserDto = req.body;  
        
        // if (!(name && email && password)) throw new HttpError('name or email or password not passed', 400);

        const newUser = await this.authService.login(name, email, password);

        return res.send(newUser);
      } catch (e) {
        if (!(e instanceof HttpError)) return res.send(e);
        return res.status(e.status).send({message: e.message, status: e.status});
      }
    })
    
    this.router.post(`${this.path}/register`, (req, res) => {
      try {

      } catch (e) {
        if (!(e instanceof HttpError)) return res.send(e);
        return res.status(e.status).send({message: e.message, status: e.status});
      }
    })
  }
}