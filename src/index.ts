import * as dotenv from 'dotenv';
import { CustomError, errorType } from './error';

dotenv.config();

process.on('uncaughtException', () => {
  throw new CustomError('uncaughtException', errorType.UncaughtException);
});

process.on('unhandledRejection', () => {
  throw new CustomError('unhandledRejection', errorType.UnhandledRejection);
});

process.on('uncaughtException', () => {
  throw new CustomError('uncaughtException', errorType.UncaughtException);
});

import app from './server';

app.listen(3000, () => {
  console.log('listening at http://localhost:3000');
});
