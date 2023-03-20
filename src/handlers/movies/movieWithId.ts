import axios from 'axios';
import { NextFunction, Request, Response } from 'express';
import { omdbApiBaseUrl } from '../../api_base_urls';
import prisma from '../../db';
import { CustomError, errorType } from '../../error';

export const movieWithId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = +req.params.id;
  if (!id) {
    throw new Error('id not found');
  }
  try {
    const movie = await prisma.movies.findUnique({
      where: {
        id,
      },
    });

    let moviePoster;
    const response = await axios.get(`${omdbApiBaseUrl}&t=${movie.name}`);
    if (response.data.Poster) {
      moviePoster = { ...movie, poster: await response.data.Poster };
    } else {
      moviePoster = { ...movie, poster: 'N/A' };
    }

    res.json({ data: { movie: moviePoster } });
  } catch (error) {
    console.error(error);
    next(
      new CustomError(
        "Error in '/movies' route",
        errorType.DatabaseError,
        error
      )
    );
  }
};
