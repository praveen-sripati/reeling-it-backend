import { Router, Request } from 'express';
import { allMovies } from './handlers/movies/allMovies';
import { moviesBasedOnRealEvents } from './handlers/movies/moviesBasedOnRealEvents';
import { movieWithId } from './handlers/movies/movieWithId';
import { searchMovies } from './handlers/movies/searchMovies';
import { topTenMoviesWeekly } from './handlers/movies/topTenMoviesWeekly';
import { yearTwentyThreeBestHits } from './handlers/movies/yearTwentyThreeBestHits';
import { yearTwentyTwoBestHits } from './handlers/movies/yearTwentyTwoBestHits';
import { allTvShows } from './handlers/tv-shows/allTvShows';

const router = Router();

// Get movies
router.get('/movies', allMovies);

// Search movies with name
// router.get('/movies', );

// Get movie with id
router.get('/movie/:id', movieWithId);

// Weekly's Top 10 movies
router.get('/top-ten-movies-weekly', topTenMoviesWeekly);

// 2022 Best Hits
router.get('/year-twenty-two-top-movies', yearTwentyTwoBestHits);

// 2023 Best Hits
router.get('/year-twenty-three-top-movies', yearTwentyThreeBestHits);

// Movies based on Real Events
router.get('/movies-based-on-real-events', moviesBasedOnRealEvents);

// Get all TV shows
router.get('/tvshows', allTvShows);

router.get('/genre', (req: Request, res, next) => {
  const genres = req.query.genres as string;

  const genresArr = genres.split(',');

  res.send(genresArr);
});

export default router;
