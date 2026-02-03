import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { libraryService } from '../services/libraryService';
import { Collection } from '../types/library.types';

interface AddToCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: {
    imdbID: string;
    title: string;
    year: string;
    poster: string;
    type: string;
  };
}

export function AddToCollectionModal({ isOpen, onClose, movie }: AddToCollectionModalProps) {
  const navigate = useNavigate();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState<number | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCollections();
    }
  }, [isOpen]);

  const loadCollections = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await libraryService.getCollections();
      setCollections(response.collections);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCollection = async (collectionId: number) => {
    setAdding(collectionId);
    setError(null);
    setSuccess(null);

    try {
      await libraryService.addMovieToCollection(collectionId, {
        imdbId: movie.imdbID,
        title: movie.title,
        year: movie.year,
        poster: movie.poster,
        type: movie.type
      });
      
      const collectionName = collections.find(c => c.id === collectionId)?.name || 'collection';
      setSuccess(`Added to ${collectionName}`);
      
      // Reload collections to update movie counts
      await loadCollections();
      
      setTimeout(() => {
        setSuccess(null);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add movie');
    } finally {
      setAdding(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Add to Collection</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-700 rounded">
          <p className="text-white font-semibold">{movie.title}</p>
          <p className="text-gray-400 text-sm">{movie.year}</p>
        </div>

        {error && (
          <div className="bg-red-500 text-white px-4 py-3 rounded mb-4 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-white hover:text-gray-200 font-bold text-xl"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="bg-green-500 text-white px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">You don't have any collections yet</p>
            <button
              onClick={() => {
                onClose();
                navigate('/library');
              }}
              className="text-purple-400 hover:text-purple-300"
            >
              Create a collection
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {collections.map((collection) => (
              <button
                key={collection.id}
                onClick={() => handleAddToCollection(collection.id)}
                disabled={adding !== null}
                className="w-full flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 rounded transition disabled:opacity-50"
              >
                <div className="text-left">
                  <p className="text-white font-semibold">{collection.name}</p>
                  <p className="text-gray-400 text-sm">
                    {collection.movieCount} {collection.movieCount === 1 ? 'movie' : 'movies'}
                  </p>
                </div>
                {adding === collection.id ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <span className="text-purple-400">+</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
