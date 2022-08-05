import { body } from 'express-validator';
import { UserService } from '../users/users.service';
const userService = new UserService();


export const isValidUser = [
  body(`email`).isEmail().withMessage('wrong email')
  .custom(async (value, {req}) => {
    try {
      const user = await userService.checkEmail(value);
      if (user) {
        return Promise.reject(`user with email ${value} already exist`);
      }
    } catch (e) {
      throw new Error(`${e}`);
    }
  }),
  body('password', 'Password must be at least 6 characters')
  .isLength({min: 6, max: 20})
  .isAlphanumeric()
  .trim()
]