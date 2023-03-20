import { NextFunction, Request, Response } from 'express';
import prisma from '../db';
import { CustomError, errorType } from '../error';
import { comparePassword, createJwt, hashPassword } from '../modules/auth';

export const createNewUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await prisma.user.create({
      data: {
        username: req.body.username,
        password: await hashPassword(req.body.password),
      },
    });
    const token = createJwt(user);
    res.json({ token });
  } catch (error) {
    console.error(error);
    next(
      new CustomError(
        "Error in '/signup' route",
        errorType.DatabaseError,
        error
      )
    );
  }
};

export const signIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        username: req.body.username,
      },
    });

    const isValid = await comparePassword(req.body.password, user.password);

    if (!isValid) {
      res.status(401);
      res.json({ message: 'Enter a valid username or password' });
      return;
    }

    const token = createJwt(user);
    res.json({ token });
  } catch (error) {
    console.error(error);
    next(
      new CustomError(
        "Error in '/signin' route",
        errorType.DatabaseError,
        error
      )
    );
  }
};
