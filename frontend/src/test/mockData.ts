import { Collection, CollectionMovie, DashboardStats } from '../types/library.types';
import { Review } from '../types/review.types';
import { MovieDetails, MovieSearchResult } from '../types/movie.types';

export const mockUser = {
  email: 'test@example.com',
  token: 'mock-jwt-token'
};

export const mockCollections: Collection[] = [
  {
    id: 1,
    name: 'Action Movies',
    movieCount: 5,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'Drama Movies',
    movieCount: 3,
    createdAt: '2024-01-02T00:00:00Z'
  }
];

export const mockCollectionMovies: CollectionMovie[] = [
  {
    id: 1,
    imdbId: 'tt0111161',
    title: 'The Shawshank Redemption',
    year: '1994',
    poster: 'https://example.com/poster1.jpg',
    type: 'movie',
    genre: 'Drama',
    averageRating: 9.5,
    addedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    imdbId: 'tt0468569',
    title: 'The Dark Knight',
    year: '2008',
    poster: 'https://example.com/poster2.jpg',
    type: 'movie',
    genre: 'Action, Crime, Drama',
    averageRating: 9.0,
    addedAt: '2024-01-02T00:00:00Z'
  }
];

export const mockReviews: Review[] = [
  {
    id: 1,
    userId: 1,
    userEmail: 'test@example.com',
    imdbId: 'tt0111161',
    rating: 10,
    reviewText: 'Amazing movie!',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    userId: 1,
    userEmail: 'test@example.com',
    imdbId: 'tt0468569',
    rating: 9,
    reviewText: 'Great superhero movie!',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  }
];

export const mockMovieSearchResults: MovieSearchResult[] = [
  {
    imdbID: 'tt0111161',
    title: 'The Shawshank Redemption',
    year: '1994',
    poster: 'https://example.com/poster1.jpg',
    type: 'movie'
  },
  {
    imdbID: 'tt0468569',
    title: 'The Dark Knight',
    year: '2008',
    poster: 'https://example.com/poster2.jpg',
    type: 'movie'
  }
];

export const mockMovieDetails: MovieDetails = {
  imdbID: 'tt0111161',
  title: 'The Shawshank Redemption',
  year: '1994',
  rated: 'R',
  runtime: '142 min',
  genre: 'Drama',
  director: 'Frank Darabont',
  actors: 'Tim Robbins, Morgan Freeman, Bob Gunton',
  plot: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
  poster: 'https://example.com/poster.jpg',
  imdbRating: '9.3',
  type: 'movie',
};

export const mockDashboardStats: DashboardStats = {
  totalCollections: 2,
  totalMovies: 5,
  totalReviews: 3,
  averageRating: 9.2,
  ratingDistribution: [
    { rating: 1, count: 0 },
    { rating: 2, count: 0 },
    { rating: 3, count: 0 },
    { rating: 4, count: 0 },
    { rating: 5, count: 0 },
    { rating: 6, count: 0 },
    { rating: 7, count: 0 },
    { rating: 8, count: 1 },
    { rating: 9, count: 1 },
    { rating: 10, count: 1 }
  ],
  genreDistribution: [
    { genre: 'Drama', count: 3 },
    { genre: 'Action', count: 2 },
    { genre: 'Crime', count: 1 }
  ],
  recentAdditions: [
    {
      imdbId: 'tt0468569',
      title: 'The Dark Knight',
      year: '2008',
      addedAt: '2024-01-02T00:00:00Z'
    },
    {
      imdbId: 'tt0111161',
      title: 'The Shawshank Redemption',
      year: '1994',
      addedAt: '2024-01-01T00:00:00Z'
    }
  ],
  topCollections: [
    { id: 1, name: 'Action Movies', movieCount: 5 },
    { id: 2, name: 'Drama Movies', movieCount: 3 }
  ]
};
