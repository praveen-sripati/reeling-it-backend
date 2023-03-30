import axios from 'axios';
import { NextFunction, Request, Response } from 'express';
import { omdbApiBaseUrl } from '../../api_base_urls';
import prisma from '../../db';
import { CustomError, errorType } from '../../error';

export const moviesBasedOnRealEvents = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const movies = await prisma.movies.findMany({
      select: {
        id: true,
        name: true,
        date: true,
        revenue: true,
      },
      where: {
        NOT: [{ date: null }, { revenue: null }],
        movie_categories: {
          some: {
            categories: {
              name: 'Real Events',
            },
          },
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
        "Error in '/year-twenty-two-top-movies' route",
        errorType.DatabaseError,
        error
      )
    );
  }
};
