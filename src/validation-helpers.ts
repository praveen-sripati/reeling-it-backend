import { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

// Generic validation error abstraction for all inputs
export const validateInputs = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  console.log(errors);

  if (!errors.isEmpty()) {
    res.status(400);
    res.json({ errors: errors.array() });
  }
  next();
};

export const validateSignInInputs = [
  body('username').isString(),
  body('password').isString(),
];

export const validateSignUpInputs = [
  body('username').isString(),
  body('password').isString(),
];
