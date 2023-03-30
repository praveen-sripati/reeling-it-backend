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
    const movie = await getMovieDetails(id);

    const updateCastsWithImageIds = await getCastImageWithIds(movie);

    const updateMovieTrailerLink = movie.trailers.map((trailer) => {
      return {
        ...trailer,
        embed_link: `https://www.youtube.com/embed/${trailer.key}?autoplay=1`,
      };
    });

    const updateMovie = {
      ...movie,
      casts: updateCastsWithImageIds,
      trailers: updateMovieTrailerLink,
    };

    let moviePoster;
    const response = await axios.get(`${omdbApiBaseUrl}&t=${movie.name}`);
    if (response.data.Poster) {
      moviePoster = { ...updateMovie, poster: await response.data.Poster };
    } else {
      moviePoster = { ...updateMovie, poster: 'N/A' };
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

const getMovieDetails = (id: number) => {
  return prisma.movies.findUnique({
    include: {
      trailers: true,
      movie_links: {
        select: {
          key: true,
          language: true,
          source: true,
        },
      },
      movie_abstracts_en: {
        select: {
          abstract: true,
        },
      },
      movie_languages: {
        select: {
          language: true,
        },
      },
      movie_countries: {
        select: {
          country: true,
        },
      },
      movie_categories: {
        select: {
          categories: {
            select: {
              name: true,
            },
          },
        },
      },
      casts: {
        select: {
          role: true,
          people: true,
          jobs: true,
          person_id: true,
        },
      },
    },
    where: {
      id,
    },
  });
};

const getCastImageWithIds = (movie: any) => {
  return Promise.all(
    movie.casts.map(async (cast) => {
      try {
        const personId = cast.person_id;
        let images = await prisma.image_licenses.findMany({
          where: {
            image_ids: {
              object_id: personId,
              object_type: 'Person',
            },
          },
        });
        images = images.map((image) => {
          return {
            ...image,
            source: `https://www.omdb.org/image/default/${image.image_id}.jpeg?v=1`,
          };
        });
        return {
          ...cast,
          image_ids: images,
        };
      } catch (error) {
        throw new Error('error');
      }
    })
  );
};

const getCastImageWithLinks = (movie: any) => {
  return Promise.all(
    movie.map(async (cast) => {
      try {
        const personId = cast.image_ids.id;
        const imageLink = await prisma.image_licenses.findMany({
          select: {
            author: true,
            source: true,
          },
          where: {
            image_id: personId,
          },
        });
        return { ...cast, imageLink };
      } catch (error) {
        throw new Error('error');
      }
    })
  );
};
