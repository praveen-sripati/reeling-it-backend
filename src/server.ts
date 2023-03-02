import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import { CustomError, customErrorMiddleware, errorType } from './error';
import { createNewUser, signIn } from './handlers/user';
import { protect } from './modules/auth';
import router from './router';
import rateLimit from 'express-rate-limit';
import {
  validateInputs,
  validateSignInInputs,
  validateSignUpInputs,
} from './validation-helpers';

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

app.get('/', (req, res) => {
  // console.log('hello from express');
  // res.status(200);
  res.json({ message: 'hello' });
  // throw new Error("Error in '/' route");
});

app.post('/signup', validateSignUpInputs, validateInputs, createNewUser);
app.post('/signin', validateSignInInputs, validateInputs, signIn);
app.use('/api', protect, router);

// Custom Error Middleware to catch errors
app.use(
  (err: CustomError, req: Request, res: Response, _next: NextFunction) => {
    console.log('res ----------->', res);
    customErrorMiddleware(err, req, res);
  }
);

export default app;
