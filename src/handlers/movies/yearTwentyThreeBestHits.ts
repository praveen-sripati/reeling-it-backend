import axios from 'axios';
import { NextFunction, Request, Response } from 'express';
import { omdbApiBaseUrl } from '../../api_base_urls';
import prisma from '../../db';
import { CustomError, errorType } from '../../error';

export const yearTwentyThreeBestHits = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const movies = await prisma.movies.findMany({
      select: {
        name: true,
        date: true,
        revenue: true,
      },
      where: {
        NOT: [{ date: null }, { revenue: null }],
        date: {
          gte: new Date('2023-01-01').toISOString(),
          lte: new Date('2023-12-31').toISOString(),
        },
        revenue: {
          gt: 0,
        },
      },
      orderBy: {
        revenue: 'desc',
      },
      take: 10,
    });

    const moviesWithPosters = await Promise.all(
      movies.map(async (movie) => {
        const response = await axios.get(`${omdbApiBaseUrl}&t=${movie.name}`);
        if (response.data.Poster) {
          return { ...movie, poster: await response.data.Poster };
        } else {
          return { ...movie, poster: 'N/A' };
        }
      })
    );
    res.json({
      data: {
        movies: moviesWithPosters,
      },
    });
  } catch (error) {
    console.error(error);
    next(
      new CustomError(
        "Error in '/year-twenty-three-top-movies' route",
        errorType.DatabaseError,
        error
      )
    );
  }
};
