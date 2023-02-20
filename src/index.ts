import * as dotenv from 'dotenv';
import config from './config';
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

app.listen(config.port, () => {
  console.log(`listening at http://localhost:${config.port}`);
});
