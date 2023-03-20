import axios from 'axios';
import { NextFunction, Request, Response } from 'express';
import { omdbApiBaseUrl } from '../../api_base_urls';
import prisma from '../../db';
import { CustomError, errorType } from '../../error';

export const topTenMoviesWeekly = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const movies = await prisma.movies.findMany({
      select: {
        name: true,
        date: true,
        votes_count: true,
      },
      where: {
        NOT: [{ date: null }, { revenue: null }],
        date: {
          lte: new Date().toISOString(),
        },
        revenue: {
          gt: 0,
        },
      },
      orderBy: {
        date: 'desc',
      },
      take: 10,
    });
    const updateMovies = movies
      .filter((movie) => movie.votes_count)
      .concat(movies.filter((movie) => !movie.votes_count))
      .map((movie) => ({ name: movie.name, date: movie.date }));

    const movieWithPosters = await Promise.all(
      updateMovies.map(async (movie) => {
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
        movies: movieWithPosters,
      },
    });
  } catch (error) {
    console.error(error);
    next(
      new CustomError(
        "Error in '/top-ten-movies-weekly' route",
        errorType.DatabaseError,
        error
      )
    );
  }
};
