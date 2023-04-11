import { body } from 'express-validator';

export const isValidUser = [
  body(`email`).isEmail().withMessage('wrong email'),
  body('password', 'password must be at least 6 characters')
    .isLength({ min: 6, max: 20 })
    .isAlphanumeric()
    .trim(),
  body('name', 'name must be at least 3 characters')
    .isLength({ min: 3, max: 25 })
    .trim(),
];

export const loginValidation = [
  body(`email`).isEmail().withMessage('wrong email'),
  body('password', 'password must be at least 6 characters')
    .isLength({ min: 6, max: 20 })
    .isAlphanumeric()
    .trim(),
];

export const tokenValidation = [
  body(`refreshToken`)
    .isString()
    .notEmpty()
    .withMessage('refresh token not passed'),
];

export const directoryValidation = [
  body(`name`).isString().notEmpty().withMessage('directory name not passed'),
];

export const updateFileValidation = [
  body(`name`)
    .optional()
    .isString()
    .notEmpty()
    .withMessage('name must be not empty string'),
  body(`parentId`)
    .optional()
    .isString()
    .notEmpty()
    .withMessage('parent must be not empty valid directory id type of string'),
];
