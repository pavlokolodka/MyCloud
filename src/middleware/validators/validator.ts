import { body } from 'express-validator';

export const isValidUser = [
  body(`email`).isEmail().withMessage('Email is not valid'),
  body('password', 'Password must be at least 6 alphanumeric characters')
    .isLength({ min: 6, max: 20 })
    .isAlphanumeric()
    .trim(),
  body('name', 'name must be at least 3 characters')
    .isLength({ min: 3, max: 25 })
    .trim(),
];

export const loginValidation = [
  body(`email`).isEmail().withMessage('Email is not valid'),
  body('password', 'Password must be at least 6 alphanumeric characters')
    .isLength({ min: 6, max: 20 })
    .isAlphanumeric()
    .trim(),
];

export const refreshTokenValidation = [
  body(`refreshToken`)
    .isString()
    .notEmpty()
    .withMessage('Refresh token is not passed'),
];

export const verificationTokenValidation = [
  body(`token`).isString().notEmpty().withMessage('Email token is not passed'),
];

export const emailValidation = [
  body(`email`).isEmail().withMessage('Email is not valid'),
];

export const passwordResetValidation = [
  body('token').isString().notEmpty().withMessage('Token is required'),
  body('password')
    .isString()
    .notEmpty()
    .isAlphanumeric()
    .isLength({ min: 6, max: 20 })
    .withMessage('Password must be at least 6 alphanumeric characters'),
  body('confirmPassword').custom((confirmPassword, { req }) => {
    const password = req.body.password;

    if (password !== confirmPassword) {
      throw new Error('Passwords must match');
    }

    return true;
  }),
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
    .withMessage('ParentId must be not empty string of valid directory id'),
];
