import { body } from 'express-validator';

export const isValidUser = [
  body(`email`).isEmail().withMessage('Email is not valid'),
  body('password', 'Password must be at least 6 characters')
    .isLength({ min: 6, max: 20 })
    .isAlphanumeric()
    .trim(),
  body('name', 'name must be at least 3 characters')
    .isLength({ min: 3, max: 25 })
    .trim(),
];

export const loginValidation = [
  body(`email`).isEmail().withMessage('Email is not valid'),
  body('password', 'Password must be at least 6 characters')
    .isLength({ min: 6, max: 20 })
    .trim(),
];

export const tokenValidation = [
  body(`refreshToken`)
    .isString()
    .notEmpty()
    .withMessage('Refresh token is not passed'),
];

export const directoryValidation = [
  body(`name`)
    .isString()
    .notEmpty()
    .withMessage('Directory name is not passed'),
];

export const updateFileValidation = [
  body(`name`)
    .optional()
    .isString()
    .notEmpty()
    .withMessage('Name must be not empty string'),
  body(`parentId`)
    .optional()
    .isString()
    .notEmpty()
    .withMessage('Parent must be not empty string of valid directory id'),
];
