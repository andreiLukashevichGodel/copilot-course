import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MovieSearchResult } from '../types/movie.types';
import { AddToCollectionModal } from './AddToCollectionModal';
import { libraryService } from '../services/libraryService';
import { MovieCollectionName } from '../types/library.types';
import { AverageRating } from './AverageRating';

interface MovieCardProps {
  movie: MovieSearchResult;
}

export function MovieCard({ movie }: MovieCardProps) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [collections, setCollections] = useState<MovieCollectionName[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(false);

  useEffect(() => {
    const fetchCollections = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      setLoadingCollections(true);
      try {
        const response = await libraryService.getMovieCollections(movie.imdbID);
        setCollections(response.collections);
      } catch (error) {
        console.error('Failed to fetch movie collections:', error);
      } finally {
        setLoadingCollections(false);
      }
    };

    fetchCollections();
  }, [movie.imdbID]);

  const handleModalClose = async () => {
    setShowModal(false);
    // Refresh collections after modal closes
    try {
      const response = await libraryService.getMovieCollections(movie.imdbID);
      setCollections(response.collections);
    } catch (error) {
      console.error('Failed to refresh movie collections:', error);
    }
  };

  return (
    <>
      <div className="bg-gray-800 rounded-lg shadow hover:shadow-xl transition overflow-hidden relative group">
        <div 
          className="aspect-[2/3] relative cursor-pointer"
          onClick={() => navigate(`/movies/${movie.imdbID}`)}
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
              setShowModal(true);
            }}
            className="absolute top-2 right-2 bg-purple-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-purple-700"
            title="Add to collection"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{movie.title}</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded">{movie.type}</span>
            <span className="text-gray-400 text-sm">{movie.year}</span>
          </div>
          <div className="mb-2">
            <AverageRating imdbId={movie.imdbID} size="small" />
          </div>
          {!loadingCollections && collections.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {collections.map((collection) => (
                <span
                  key={collection.id}
                  className="bg-green-600 text-white text-xs px-2 py-1 rounded-full"
                  title={`In ${collection.name}`}
                >
                  {collection.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <AddToCollectionModal
        isOpen={showModal}
        onClose={handleModalClose}
        movie={{
          imdbID: movie.imdbID,
          title: movie.title,
          year: movie.year,
          poster: movie.poster,
          type: movie.type
        }}
      />
    </>
  );
}
