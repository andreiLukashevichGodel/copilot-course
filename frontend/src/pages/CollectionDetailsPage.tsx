import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { libraryService } from '../services/libraryService';
import { CollectionMovie, CollectionFilters as FilterParams } from '../types/library.types';
import { AverageRating } from '../components/AverageRating';
import { CollectionFilters } from '../components/CollectionFilters';
import { Pagination } from '../components/Pagination';

export function CollectionDetailsPage() {
  const { collectionId } = useParams<{ collectionId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [movies, setMovies] = useState<CollectionMovie[]>([]);
  const [collectionName, setCollectionName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [genresLoading, setGenresLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadCollectionGenres();
  }, [collectionId]);

  useEffect(() => {
    loadCollectionData();
  }, [collectionId, searchParams]);

  const loadCollectionGenres = async () => {
    if (!collectionId) return;

    setGenresLoading(true);
    try {
      const genresResponse = await libraryService.getCollectionGenres(parseInt(collectionId));
      setAvailableGenres(genresResponse.genres);
    } catch (err) {
      console.error('Failed to load genres:', err);
    } finally {
      setGenresLoading(false);
    }
  };

  const loadCollectionData = async () => {
    if (!collectionId) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch collection name
      const collectionsResponse = await libraryService.getCollections();
      const collection = collectionsResponse.collections.find(
        c => c.id === parseInt(collectionId)
      );
      if (collection) {
        setCollectionName(collection.name);
      }

      // Build filter params from URL
      const filters: FilterParams = {
        sortBy: searchParams.get('sortBy') || undefined,
        sortOrder: searchParams.get('sortOrder') || undefined,
        filterGenres: searchParams.get('filterGenres') || undefined,
        filterYearFrom: searchParams.get('filterYearFrom') ? parseInt(searchParams.get('filterYearFrom')!) : undefined,
        filterYearTo: searchParams.get('filterYearTo') ? parseInt(searchParams.get('filterYearTo')!) : undefined,
        minRating: searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined,
        page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
        pageSize: 20
      };

      // Fetch movies in collection with filters
      const moviesResponse = await libraryService.getCollectionMovies(parseInt(collectionId), filters);
      setMovies(moviesResponse.movies);
      setTotalCount(moviesResponse.totalCount);
      setTotalPages(moviesResponse.totalPages);
      setCurrentPage(moviesResponse.currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load collection');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMovie = async (imdbId: string) => {
    if (!collectionId) return;

    try {
      await libraryService.removeMovieFromCollection(parseInt(collectionId), imdbId);
      await loadCollectionData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove movie');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <button
          onClick={() => navigate('/library')}
          className="mb-6 text-purple-400 hover:text-purple-300 flex items-center gap-2"
        >
          <span>←</span> Back to Library
        </button>

        {collectionName && (
          <h1 className="text-3xl font-bold text-white mb-6">{collectionName}</h1>
        )}

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

        {/* Filters */}
        <CollectionFilters 
          availableGenres={availableGenres} 
          onGenresLoading={genresLoading}
        />

        {movies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">
              {searchParams.toString() ? 'No movies match your filters' : 'No movies in this collection yet'}
            </p>
            <button
              onClick={() => navigate('/movies')}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Browse Movies
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">{movies.map((movie) => (
              <div
                key={movie.id}
                className="bg-gray-800 rounded-lg shadow hover:shadow-xl transition overflow-hidden relative group"
              >
                <div
                  className="aspect-[2/3] relative cursor-pointer"
                  onClick={() => navigate(`/movies/${movie.imdbId}`)}
                >
                  {movie.poster !== 'N/A' ? (
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">No Poster</span>
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveMovie(movie.imdbId);
                    }}
                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-700"
                    title="Remove from collection"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{movie.title}</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded">{movie.type}</span>
                    <span className="text-gray-400 text-sm">{movie.year}</span>
                  </div>
                  <div>
                    <AverageRating imdbId={movie.imdbId} size='small' />
                  </div>
                </div>
              </div>
            ))}
            </div>
            
            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={20}
            />
          </>
        )}
      </div>
    </div>
  );
}
