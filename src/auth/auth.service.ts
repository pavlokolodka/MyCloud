import { UserService } from "../users/users.service";
import bcrypt from 'bcrypt';
import { HttpError } from "../utils/Error";
import * as jwt from 'jsonwebtoken'
import { refreshSecretKey, secretKey } from "./constants";

export class AuthService {
  constructor(private userService = new UserService()) {}

  public async login(email: string, password: string) {
    const candidate = await this.userService.checkEmail(email);

    if (!candidate) throw new HttpError(`user with email ${email} doesn't exist`, 404);

    const isEqualPassword = await bcrypt.compare(password, candidate.password);

    if (!isEqualPassword) throw new HttpError('wrong password', 400);

    const token = jwt.sign({email: candidate.email}, secretKey, { expiresIn: '1h' }); 
    const refreshToken = jwt.sign({email: candidate.email}, refreshSecretKey, { expiresIn: '2h' }); 

    const user = {
      token: token,
      refreshToken: refreshToken,
      user: {
      name: candidate.name,
      email: candidate.email,
      files: candidate.files,
    }};

    return user;
  }

  public async register(name: string, email: string, password: string) {
    const candidate = await this.userService.checkEmail(email);
    
    if (candidate) throw new HttpError(`user with email ${email} aready exist`, 400)
    
    const hashPassword = await bcrypt.hash(password, 10);

    const user = await this.userService.create({
      name,
      email,
      password: hashPassword
    })

    const token = jwt.sign({email: user.email}, secretKey, { expiresIn: '1h' }); 
    const refreshToken = jwt.sign({email: user.email}, refreshSecretKey, { expiresIn: '2h' });

    return {
      token: token,
      refreshToken: refreshToken,
      user: {
        name: user.name,
        email: user.email,
      }
    };
  }

  public refreshTokens(rawToken: string) {
    const payload = this.getPayload(rawToken);

    const token = jwt.sign({email: payload}, secretKey, { expiresIn: '1h' }); 
    const refreshToken = jwt.sign({email: payload}, refreshSecretKey, { expiresIn: '2h' });

    return {token, refreshToken};
  }

  public getPayload(token: string, refreshToken = true) {
    try {
      let payload: jwt.JwtPayload;

      if (!refreshToken) {
        payload = jwt.verify(token, secretKey) as unknown as jwt.JwtPayload;
   
        return payload.email;
      }

      payload = jwt.verify(token, refreshSecretKey) as unknown as jwt.JwtPayload;
   
      return payload.email;
    } catch (error) {
      throw new HttpError('Invalid JWT token', 401)
    }
  }

  public getPayloadFromRawToken(rawToken: string) {
    const [bearer, token] = rawToken.split(' ');
   
    if (!bearer || bearer !== 'Bearer') {
      throw new HttpError('Invalid token format', 401);
    }

    if (!token) {
      throw new HttpError('Invalid auth token', 401);
    }
    
    return this.getPayload(token, false);
  }
}