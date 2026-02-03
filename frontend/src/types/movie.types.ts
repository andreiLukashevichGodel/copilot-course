export interface MovieSearchResult {
  title: string;
  year: string;
  imdbID: string;
  type: string;
  poster: string;
}

export interface MovieDetails {
  title: string;
  year: string;
  rated: string;
  runtime: string;
  genre: string;
  director: string;
  actors: string;
  plot: string;
  poster: string;
  imdbRating: string;
  imdbID: string;
  type: string;
}

export interface SearchMoviesResponse {
  movies: MovieSearchResult[];
}
