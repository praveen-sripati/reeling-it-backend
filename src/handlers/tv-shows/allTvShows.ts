import { kind } from '@prisma/client';
import axios from 'axios';
import { Request, Response, NextFunction } from 'express';
import { omdbApiBaseUrl } from '../../api_base_urls';
import prisma from '../../db';
import { CustomError, errorType } from '../../error';

export const allTvShows = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const search = req.query.search?.toString();
  const page = +req.query.page;
  const limit = +req.query.limit;
  const skip = page * limit - limit;

  // search

  if ((limit && limit < 0) || (skip && skip < 0)) {
    next(
      new CustomError(
        "query params are not defined, route => '/tvshows'",
        errorType.ValidationError
      )
    );
  }

  try {
    const totalSearchTvShowsCount = await getSearchTvShowsCount(search);
    const totalSearchPages = getTotalPages(totalSearchTvShowsCount, limit);

    let tvShows = await getTvShows(skip, limit, search);

    const tvShowPosters = await getTvShowsPosters(tvShows);

    tvShows = getTvShowsWithPosters(tvShows, tvShowPosters);

    res.json({
      data: {
        tv_shows: tvShows,
        total_pages: totalSearchPages,
      },
    });
  } catch (error) {
    console.error(error);
    next(
      new CustomError(
        "Error in '/tvshows' route",
        errorType.DatabaseError,
        error
      )
    );
  }
};

// Getters starts

const getSearchTvShowsCount = async (search) => {
  return prisma.movies.count({
    where: {
      NOT: [
        { date: null },
        { kind: null },
        { kind: 'episode' },
        { kind: 'movie' },
        { kind: 'movieseries' },
        { name: null },
      ],
      name: {
        contains: search,
        mode: 'insensitive',
      },
    },
  });
};

const getTotalPages = (totalTvShowsCount: number, limit: number) => {
  return Math.ceil(totalTvShowsCount / limit);
};

const getTvShows = async (skip: number, limit: number, search: string) => {
  return prisma.movies.findMany({
    skip: skip,
    take: limit,
    select: {
      name: true,
      date: true,
    },
    where: {
      NOT: [
        { date: null },
        { kind: null },
        { kind: 'episode' },
        { kind: 'movie' },
        { kind: 'movieseries' },
        { name: null },
      ],
      name: { contains: search, mode: 'insensitive' },
    },
    orderBy: {
      date: 'desc',
    },
  });
};

const getTvShowsPosters = async (
  tvShows: {
    name: string;
    date: Date;
  }[]
) => {
  return Promise.all(
    tvShows.map(async (tvShow) => {
      const response = await axios.get(`${omdbApiBaseUrl}&t=${tvShow.name}`);
      if (response.data.Poster) {
        return { poster: await response.data.Poster };
      } else {
        return { poster: 'N/A' };
      }
    })
  );
};

const getTvShowsWithPosters = (
  tvShows: {
    name: string;
    date: Date;
  }[],
  tvShowsPosters: {
    poster: any;
  }[]
) => {
  return tvShows.map((tvShow, index) => ({
    ...tvShow,
    ...tvShowsPosters[index],
  }));
};
// Getters ends
