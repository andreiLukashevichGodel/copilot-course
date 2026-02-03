import { MovieDetails, SearchMoviesResponse } from '../types/movie.types';

const API_BASE_URL = 'http://localhost:5000/api';

export const movieService = {
  async searchMovies(query: string): Promise<SearchMoviesResponse> {
    const response = await fetch(`${API_BASE_URL}/movies/search?query=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      const text = await response.text();
      let error;
      try {
        error = text ? JSON.parse(text) : {};
      } catch {
        error = { message: 'Failed to search movies' };
      }
      throw new Error(error.message || 'Failed to search movies');
    }
    
    return response.json();
  },

  async getMovieDetails(imdbId: string): Promise<MovieDetails> {
    const response = await fetch(`${API_BASE_URL}/movies/${imdbId}`);
    
    if (!response.ok) {
      const text = await response.text();
      let error;
      try {
        error = text ? JSON.parse(text) : {};
      } catch {
        error = { message: 'Failed to fetch movie details' };
      }
      throw new Error(error.message || 'Failed to fetch movie details');
    }
    
    return response.json();
  },

  // Cache search results in sessionStorage
  cacheSearchResults(query: string, results: SearchMoviesResponse): void {
    sessionStorage.setItem('cached_search_query', query);
    sessionStorage.setItem('cached_search_results', JSON.stringify(results));
  },

  // Get cached search results from sessionStorage
  getCachedSearchResults(): { query: string; results: SearchMoviesResponse } | null {
    const cachedQuery = sessionStorage.getItem('cached_search_query');
    const cachedResults = sessionStorage.getItem('cached_search_results');
    
    if (cachedQuery && cachedResults) {
      try {
        return {
          query: cachedQuery,
          results: JSON.parse(cachedResults)
        };
      } catch {
        return null;
      }
    }
    
    return null;
  },

  // Clear cached search results
  clearCachedSearchResults(): void {
    sessionStorage.removeItem('cached_search_query');
    sessionStorage.removeItem('cached_search_results');
  }
};
