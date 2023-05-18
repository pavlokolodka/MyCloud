import MailService from '../notification-services/mail.service';
import { UserRepository } from '../users/model/users.repository';
import { UserService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const AuthModule = new Map();
const authServices = new Map();
const userService = new Map();
userService.set(UserService, UserRepository);
authServices.set(AuthService, [userService, MailService]);
authServices.set(UserService, [UserRepository]);
AuthModule.set(AuthController, [authServices]);

export default AuthModule;
