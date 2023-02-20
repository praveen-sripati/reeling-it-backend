import { NextFunction, Request, Response } from 'express';

export enum errorType {
  AuthorizationError = 'AuthorizationError',
  GenericError = 'GenericError',
  ValidationError = 'ValidationError',
  DatabaseError = 'DatabaseError',
  InternalServerError = 'InternalServerError',
  NetworkError = 'NetworkError',
  FileSystemError = 'FileSystemError',
  UncaughtException = 'UncaughtException',
  UnhandledRejection = 'UnhandledRejection',
}

export class CustomError extends Error {
  type = errorType.GenericError;
  error: any;
  status: number;

  constructor(message: string, type: errorType, error: any = null) {
    super(message);
    this.type = type;
    this.error = error;
    this.message = `${message}`;
    if (type === errorType.GenericError || type === errorType.ValidationError) {
      this.status = 400;
    } else if (type === errorType.AuthorizationError) {
      this.status = 401;
    } else if (
      type === errorType.InternalServerError ||
      type === errorType.DatabaseError
    ) {
      this.status = 500;
    } else {
      this.status = undefined;
    }
  }
}

export const customErrorMiddleware = (
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  res.status(err.status ?? 400);
  res.json({
    error: {
      name: err.name,
      type: err.type,
      status: err.status,
      message: err.message,
      errorStack: err.stack,
      cause: err.cause,
    },
  });
};
