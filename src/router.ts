import axios from 'axios';
import { NextFunction, Request, Response, Router } from 'express';
import { omdbApiBaseUrl } from './api_base_urls';
import prisma from './db';
import { CustomError, errorType } from './error';

const router = Router();

// Get movies
router.get(
  '/movies',
  async (req: Request, res: Response, next: NextFunction) => {
    const page = +req.query.page;
    const limit = +req.query.limit;
    const skip = page * limit - limit;

    if ((limit && limit < 0) || (skip && skip < 0)) {
      next(
        new CustomError(
          "page/limit is not defined, route => '/movies'",
          errorType.ValidationError
        )
      );
    }

    try {
      const totalMoviesCount = await prisma.movies.count();
      const totalPages = Math.ceil(totalMoviesCount / limit);
      let movies = await prisma.movies.findMany({
        skip: skip,
        take: limit,
        select: {
          name: true,
          date: true,
        },
        where: {
          NOT: [{ date: null }, { kind: null }, { name: null }],
          kind: 'movie',
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
            return { poster: 'NA' };
          }
        })
      );
      movies = movies.map((movie, index) => ({
        ...movie,
        total_pages: totalPages,
        ...moviePosters[index],
      }));
      res.json({ data: movies });
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
  }
);

// Get movie with id
router.get(
  '/movie/:id',
  async (req: Request, res: Response, next: NextFunction) => {
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
        moviePoster = { ...movie, poster: 'NA' };
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
  }
);

// Weekly's Top 10 movies
router.get(
  '/top-ten-movies-weekly',
  async (_req: Request, res: Response, next: NextFunction) => {
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
            return { ...movie, poster: 'NA' };
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
  }
);

// 2022 Best Hits
router.get(
  '/year-twenty-two-top-movies',
  async (_req: Request, res: Response, next: NextFunction) => {
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
            gte: new Date('2022-01-01').toISOString(),
            lte: new Date('2022-12-31').toISOString(),
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
            return { ...movie, poster: 'NA' };
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
  }
);

// 2023 Best Hits
router.get(
  '/year-twenty-three-top-movies',
  async (_req: Request, res: Response, next: NextFunction) => {
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
            return { ...movie, poster: 'NA' };
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
  }
);

// Movies based on Real Events
router.get(
  '/movies-based-on-real-events',
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const movies = await prisma.movies.findMany({
        select: {
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
            return { ...movie, poster: 'NA' };
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
  }
);

// router.put('/movie:id', () => {});
// router.post('/movie', () => {});
// router.delete('/movie:id', () => {});

export default router;
