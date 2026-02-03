import { useState, useEffect } from 'react';
import { movieService } from '../services/movieService';
import { MovieSearchResult } from '../types/movie.types';
import { MovieCard } from '../components/MovieCard';
import { useDebounce } from '../hooks/useDebounce';

export function MoviesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState<MovieSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Load cached search results from sessionStorage on mount
  useEffect(() => {
    const cachedData = movieService.getCachedSearchResults();
    if (cachedData) {
      setSearchQuery(cachedData.query);
      setMovies(cachedData.results.movies);
    }
    setInitialLoadComplete(true);
  }, []);

  // Search for movies when debounced query changes
  useEffect(() => {
    const fetchMovies = async () => {
      if (!debouncedSearchQuery.trim()) {
        setMovies([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await movieService.searchMovies(debouncedSearchQuery);
        setMovies(response.movies);
        
        // Cache the search results locally
        movieService.cacheSearchResults(debouncedSearchQuery, response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch movies');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if initial load is complete
    if (initialLoadComplete) {
      fetchMovies();
    }
  }, [debouncedSearchQuery, initialLoadComplete]);

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Browse Movies</h1>
          <input
            type="text"
            placeholder="Search for movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        {error && (
          <div className="bg-red-500 text-white px-4 py-3 rounded mb-6 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-white hover:text-gray-200 font-bold text-xl"
            >
              ×
            </button>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        )}

        {!loading && movies.length === 0 && debouncedSearchQuery.trim() && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No movies found</p>
          </div>
        )}

        {!loading && movies.length === 0 && !debouncedSearchQuery.trim() && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Start searching for movies</p>
          </div>
        )}

        {!loading && movies.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {movies.map((movie) => (
              <MovieCard key={movie.imdbID} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
