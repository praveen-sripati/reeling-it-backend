import axios from 'axios';
import { NextFunction, Request, Response } from 'express';
import { omdbApiBaseUrl } from '../../api_base_urls';
import prisma from '../../db';
import { CustomError, errorType } from '../../error';

export const searchMovies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const page = +req.query.page;
  const limit = +req.query.limit;
  const skip = page * limit - limit;
  const search = req.query.search?.toString();

  if ((limit && limit < 0) || (skip && skip < 0)) {
    next(
      new CustomError(
        "page/limit is not defined, route => '/movies'",
        errorType.ValidationError
      )
    );
  }

  try {
    const totalMoviesCount = await prisma.movies.count({
      where: {
        NOT: [{ name: null }],
        kind: 'movie',
      },
    });
    const totalPages = Math.ceil(totalMoviesCount / limit);
    const searchedResults = await prisma.movies.count({
      where: {
        NOT: [{ name: null }],
        kind: 'movie',
        name: {
          contains: '',
        },
      },
    });
    let movies = await prisma.movies.findMany({
      skip: skip,
      take: limit,
      select: {
        id: true,
        name: true,
        date: true,
      },
      where: {
        NOT: [{ name: null }],
        kind: 'movie',
        name: {
          contains: '',
          mode: 'insensitive',
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    const moviePosters = await Promise.all(
      movies.map(async (movie) => {
        const response = await axios.get(`${omdbApiBaseUrl}&t=${movie.name}`);
        if (response.data.Poster) {
          return { poster: await response.data.Poster };
        } else {
          return { poster: 'N/A' };
        }
      })
    );

    movies = movies.map((movie, index) => ({
      ...movie,
      ...moviePosters[index],
    }));

    res.json({ data: { movies, totalPages, searchedResults } });
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
