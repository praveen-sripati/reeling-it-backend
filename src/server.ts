import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import { CustomError, customErrorMiddleware, errorType } from './error';
import { createNewUser, signIn } from './handlers/user';
import { protect } from './modules/auth';
import router from './router';
import {
  validateInputs,
  validateSignInInputs,
  validateSignUpInputs,
} from './validation-helpers';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  // console.log('hello from express');
  // res.status(200);
  res.json({ message: 'hello' });
  throw new Error("Error in '/' route");
});

app.use('/api', protect, router);
app.post('/signup', validateSignUpInputs, validateInputs, createNewUser);
app.post('/signin', validateSignInInputs, validateInputs, signIn);

// Custom Error Middleware to catch errors
app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
  customErrorMiddleware(err, req, res, next);
});

export default app;
