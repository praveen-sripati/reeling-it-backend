import axios from 'axios';
import { NextFunction, Request, Response } from 'express';
import { omdbApiBaseUrl } from '../../api_base_urls';
import prisma from '../../db';
import { CustomError, errorType } from '../../error';

export const allMovies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let genres = [];
  const search = req.query.search as string;
  const genre = req.query.genre as string;
  if (genre && genre.length > 0) {
    genres = genre.split(',');
  }
  const dateRangeLowerYear = +req.query.year_lower;
  const dateRangeUpperYear = +req.query.year_upper;
  const page = +req.query.page;
  const limit = +req.query.limit;
  const skip = page * limit - limit;

  // search

  if ((limit && limit < 0) || (skip && skip < 0)) {
    next(
      new CustomError(
        "page/limit is not defined, route => '/movies'",
        errorType.ValidationError
      )
    );
  }

  try {
    let totalMoviesWithGenre = 0;
    if (genres.includes('allmovies')) {
      totalMoviesWithGenre = await getTotalMoviesWithGenre(
        search,
        dateRangeLowerYear,
        dateRangeUpperYear
      );
    } else {
      totalMoviesWithGenre = await getTotalMoviesWithGenre(
        search,
        dateRangeLowerYear,
        dateRangeUpperYear,
        genres
      );
      console.log('total movies count => ', totalMoviesWithGenre);
    }
    const totalMoviePagesWithFilters = getTotalPages(
      totalMoviesWithGenre,
      limit
    );

    console.log('totalMoviesWithGenre', totalMoviesWithGenre);

    let movies = await getMovies(
      skip,
      limit,
      search,
      genres,
      dateRangeLowerYear,
      dateRangeUpperYear
    );

    const moviePosters = await getMoviePosters(movies);

    movies = getMoviesWithPosters(movies, moviePosters);

    res.json({
      data: {
        movies,
        total_items: totalMoviesWithGenre,
        total_pages: totalMoviePagesWithFilters,
      },
    });
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

// Getters starts

const getTotalMoviesWithGenre = async (
  search,
  dateRangeLowerYear,
  dateRangeUpperYear,
  genres = null
) => {
  if (!genres) {
    return prisma.movies.count({
      where: {
        NOT: [{ date: null }, { kind: null }, { name: null }],
        kind: 'movie',
        date: {
          gte: new Date(`${dateRangeLowerYear}-01-01`),
          lte: new Date(`${dateRangeUpperYear}-12-31`),
        },
        name: {
          contains: search,
          mode: 'insensitive',
        },
      },
    });
  }
  return prisma.movies.count({
    where: {
      NOT: [{ date: null }, { kind: null }, { name: null }],
      kind: 'movie',
      name: {
        contains: search,
        mode: 'insensitive',
      },
      date: {
        gte: new Date(`${dateRangeLowerYear}-01-01`),
        lte: new Date(`${dateRangeUpperYear}-12-31`),
      },
      movie_categories: {
        some: {
          categories: {
            name: {
              in: genres,
            },
          },
        },
      },
    },
  });
};

const getTotalPages = (totalMoviesCount: number, limit: number) => {
  console.log(' totalMoviesCount => ', totalMoviesCount);
  return Math.ceil(totalMoviesCount / limit);
};

const getMovies = async (
  skip: number,
  limit: number,
  search: string,
  genres: string[],
  dateRangeLowerYear: number,
  dateRangeUpperYear: number
) => {
  if (genres.includes('allmovies')) {
    return prisma.movies.findMany({
      skip,
      take: limit,
      select: {
        name: true,
        date: true,
        movie_categories: {
          select: {
            categories: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      where: {
        NOT: [{ date: null }, { kind: null }, { name: null }],
        kind: 'movie',
        date: {
          gte: new Date(`${dateRangeLowerYear}-01-01`),
          lte: new Date(`${dateRangeUpperYear}-12-31`),
        },
        name: { contains: search, mode: 'insensitive' },
      },
      orderBy: {
        date: 'desc',
      },
    });
  } else {
    return prisma.movies.findMany({
      skip,
      take: limit,
      select: {
        name: true,
        date: true,
        movie_categories: {
          select: {
            categories: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      where: {
        NOT: [{ date: null }, { kind: null }, { name: null }],
        kind: 'movie',
        name: { contains: search, mode: 'insensitive' },
        date: {
          gte: new Date(`${dateRangeLowerYear}-01-01`),
          lte: new Date(`${dateRangeUpperYear}-12-31`),
        },
        movie_categories: {
          some: {
            categories: {
              name: {
                in: genres,
              },
            },
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }
};

const getMoviePosters = async (
  movies: {
    name: string;
    date: Date;
  }[]
) => {
  return Promise.all(
    movies.map(async (movie) => {
      const response = await axios.get(`${omdbApiBaseUrl}&t=${movie.name}`);
      if (response.data.Poster) {
        return { poster: await response.data.Poster };
      } else {
        return { poster: 'N/A' };
      }
    })
  );
};

const getMoviesWithPosters = (
  movies: {
    name: string;
    date: Date;
    movie_categories: {
      categories: {
        name: string;
      };
    }[];
  }[],
  moviePosters: {
    poster: any;
  }[]
) => {
  return movies.map((movie, index) => ({
    ...movie,
    ...moviePosters[index],
  }));
};
// Getters ends
