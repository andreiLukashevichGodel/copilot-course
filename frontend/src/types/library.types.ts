export interface Collection {
  id: number;
  name: string;
  movieCount: number;
  createdAt: string;
}

export interface CollectionMovie {
  id: number;
  imdbId: string;
  title: string;
  year: string;
  poster: string;
  type: string;
  genre?: string | null;
  averageRating?: number | null;
  addedAt: string;
}

export interface CreateCollectionRequest {
  name: string;
}

export interface AddMovieToCollectionRequest {
  imdbId: string;
  title: string;
  year: string;
  poster: string;
  type: string;
}

export interface GetCollectionsResponse {
  collections: Collection[];
}

export interface GetCollectionMoviesResponse {
  movies: CollectionMovie[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface GetCollectionGenresResponse {
  genres: string[];
}

export interface CollectionFilters {
  sortBy?: string;
  sortOrder?: string;
  filterGenres?: string;
  filterYearFrom?: number;
  filterYearTo?: number;
  minRating?: number;
  page?: number;
  pageSize?: number;
}

export interface MovieCollectionName {
  id: number;
  name: string;
}

export interface GetMovieCollectionsResponse {
  collections: MovieCollectionName[];
}

export interface RatingDistributionItem {
  rating: number;
  count: number;
}

export interface GenreDistributionItem {
  genre: string;
  count: number;
}

export interface RecentAdditionItem {
  imdbId: string;
  title: string;
  year: string;
  addedAt: string;
}

export interface TopCollectionItem {
  id: number;
  name: string;
  movieCount: number;
}

export interface DashboardStats {
  totalCollections: number;
  totalMovies: number;
  totalReviews: number;
  averageRating: number;
  ratingDistribution: RatingDistributionItem[];
  genreDistribution: GenreDistributionItem[];
  recentAdditions: RecentAdditionItem[];
  topCollections: TopCollectionItem[];
}
