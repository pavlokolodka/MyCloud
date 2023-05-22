import { ValidationError } from 'express-validator';

export const prepareValidationErrorMessage = (
  errors: Array<ValidationError>,
): string => {
  const result = [];

  for (let i = 0; i < errors.length; i++) {
    result.push({
      [errors[i].param]: errors[i].msg,
    });
  }

  return JSON.stringify(result);
};
