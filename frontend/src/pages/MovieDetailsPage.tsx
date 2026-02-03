import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { movieService } from '../services/movieService';
import { MovieDetails } from '../types/movie.types';
import { AddToCollectionModal } from '../components/AddToCollectionModal';
import { libraryService } from '../services/libraryService';
import { MovieCollectionName } from '../types/library.types';
import { reviewService } from '../services/reviewService';
import { Review } from '../types/review.types';
import { AverageRating } from '../components/AverageRating';
import { ReviewCard } from '../components/ReviewCard';
import { ReviewForm } from '../components/ReviewForm';
import { ReviewsList } from '../components/ReviewsList';
import { useAuth } from '../contexts/AuthContext';

export function MovieDetailsPage() {
  const { imdbId } = useParams<{ imdbId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collections, setCollections] = useState<MovieCollectionName[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(false);
  
  // Review state
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [loadingMyReview, setLoadingMyReview] = useState(false);
  const [showWriteReviewForm, setShowWriteReviewForm] = useState(false);
  const [reviewsKey, setReviewsKey] = useState(0);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!imdbId) return;

      setLoading(true);
      setError(null);

      try {
        const data = await movieService.getMovieDetails(imdbId);
        setMovie(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch movie details');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [imdbId]);

  useEffect(() => {
    const fetchCollections = async () => {
      if (!imdbId) return;
      
      const token = localStorage.getItem('authToken');
      if (!token) return;

      setLoadingCollections(true);
      try {
        const response = await libraryService.getMovieCollections(imdbId);
        setCollections(response.collections);
      } catch (error) {
        console.error('Failed to fetch movie collections:', error);
      } finally {
        setLoadingCollections(false);
      }
    };

    fetchCollections();
  }, [imdbId]);

  // Fetch user's review
  useEffect(() => {
    const fetchMyReview = async () => {
      if (!imdbId || !user) return;

      setLoadingMyReview(true);
      try {
        const review = await reviewService.getMyReview(imdbId);
        setMyReview(review);
      } catch (error) {
        console.error('Failed to fetch my review:', error);
      } finally {
        setLoadingMyReview(false);
      }
    };

    fetchMyReview();
  }, [imdbId, user]);

  const handleModalClose = async () => {
    setShowModal(false);
    // Refresh collections after modal closes
    if (imdbId) {
      try {
        const response = await libraryService.getMovieCollections(imdbId);
        setCollections(response.collections);
      } catch (error) {
        console.error('Failed to refresh movie collections:', error);
      }
    }
  };

  const handleReviewSuccess = async () => {
    setShowWriteReviewForm(false);
    setReviewsKey(prev => prev + 1);
    
    if (imdbId && user) {
      try {
        const review = await reviewService.getMyReview(imdbId);
        setMyReview(review);
      } catch (error) {
        console.error('Failed to refresh my review:', error);
      }
    }
  };

  const handleReviewUpdate = async () => {
    setReviewsKey(prev => prev + 1);
    
    if (imdbId && user) {
      try {
        const review = await reviewService.getMyReview(imdbId);
        setMyReview(review);
      } catch (error) {
        console.error('Failed to refresh my review:', error);
      }
    }
  };

  const handleReviewDelete = async () => {
    setMyReview(null);
    setReviewsKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-red-500 text-white px-4 py-3 rounded mb-6 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-white hover:text-gray-200 font-bold text-xl"
            >
              ×
            </button>
          </div>
          <button
            onClick={() => navigate('/movies')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Back to Movies
          </button>
        </div>
      </div>
    );
  }

  if (!movie) return null;

  const genres = movie.genre.split(',').map(g => g.trim());

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/movies')}
            className="text-purple-400 hover:text-purple-300 flex items-center gap-2"
          >
            <span>←</span> Back to Movies
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add to Collection
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            {movie.poster !== 'N/A' ? (
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-full aspect-[2/3] bg-gray-800 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">No Poster Available</span>
              </div>
            )}
          </div>

          <div className="md:col-span-2 text-white">
            <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
            
            <div className="mb-4">
              <AverageRating key={reviewsKey} imdbId={movie.imdbID} size="large" />
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="text-gray-400">{movie.year}</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">{movie.rated}</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">{movie.runtime}</span>
              <span className="text-gray-400">•</span>
              <div className="flex items-center gap-1">
                <span className="text-yellow-400">★</span>
                <span className="text-white font-semibold">{movie.imdbRating}</span>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Genre</h2>
              <div className="flex flex-wrap gap-2">
                {genres.map((genre, index) => (
                  <span
                    key={index}
                    className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Plot</h2>
              <p className="text-gray-300 leading-relaxed">{movie.plot}</p>
            </div>

            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Director</h2>
              <p className="text-gray-300">{movie.director}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Cast</h2>
              <p className="text-gray-300">{movie.actors}</p>
            </div>

            {!loadingCollections && collections.length > 0 && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-2">In Collections</h2>
                <div className="flex flex-wrap gap-2">
                  {collections.map((collection) => (
                    <span
                      key={collection.id}
                      className="bg-green-600 text-white px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-green-700 transition"
                      onClick={() => navigate(`/library/${collection.id}`)}
                      title="View collection"
                    >
                      {collection.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-white mb-6">Reviews</h2>
          
          {/* User's Review or Write Review Button */}
          {user && !loadingMyReview && (
            <div className="mb-8">
              {myReview ? (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Your Review</h3>
                  <ReviewCard
                    review={myReview}
                    isOwnReview={true}
                    onUpdate={handleReviewUpdate}
                    onDelete={handleReviewDelete}
                  />
                </div>
              ) : showWriteReviewForm ? (
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Write Your Review</h3>
                  <ReviewForm
                    imdbId={movie.imdbID}
                    existingReview={null}
                    onSuccess={handleReviewSuccess}
                    onCancel={() => setShowWriteReviewForm(false)}
                  />
                </div>
              ) : (
                <button
                  onClick={() => setShowWriteReviewForm(true)}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Write a Review
                </button>
              )}
            </div>
          )}

          {/* All Reviews */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">
              {user && myReview ? 'Other Reviews' : 'All Reviews'}
            </h3>
            <ReviewsList
              key={reviewsKey}
              imdbId={movie.imdbID}
              excludeUserId={user?.id}
              onReviewUpdate={() => setReviewsKey(prev => prev + 1)}
            />
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
      </div>
    </div>
  );
}
