import { useState, useEffect, useRef, useCallback } from 'react';
import { reviewService } from '../services/reviewService';
import { Review } from '../types/review.types';
import { ReviewCard } from './ReviewCard';

interface ReviewsListProps {
  imdbId: string;
  excludeUserId?: number;
  onReviewUpdate?: () => void;
}

export function ReviewsList({ imdbId, excludeUserId, onReviewUpdate }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skip, setSkip] = useState(0);
  const take = 20;
  
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadReviews = async (skipCount: number, append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const response = await reviewService.getMovieReviews(imdbId, skipCount, take);
      
      if (append) {
        setReviews(prev => [...prev, ...response.reviews]);
      } else {
        setReviews(response.reviews);
      }
      
      setHasMore(response.hasMore);
      setSkip(skipCount + response.reviews.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadReviews(0, false);
  }, [imdbId]);

  // Intersection Observer for infinite scroll (trigger at 80% scroll)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadReviews(skip, true);
        }
      },
      { threshold: 0.8, rootMargin: '100px' }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadingMore, loading, skip]);

  const handleReviewUpdate = useCallback(() => {
    loadReviews(0, false);
    onReviewUpdate?.();
  }, [imdbId, onReviewUpdate]);

  const handleReviewDelete = useCallback(async (reviewImdbId: string) => {
    try {
      await reviewService.deleteReview(reviewImdbId);
      loadReviews(0, false);
      onReviewUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete review');
    }
  }, [imdbId, onReviewUpdate]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg mb-2">No reviews yet</p>
        <p className="text-gray-500">Be the first to review this movie!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          isOwnReview={excludeUserId !== undefined && review.userId === excludeUserId}
          onUpdate={handleReviewUpdate}
          onDelete={() => handleReviewDelete(review.imdbId)}
        />
      ))}

      {/* Sentinel element for infinite scroll */}
      <div ref={observerTarget} className="py-4">
        {loadingMore && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        )}
        {!hasMore && reviews.length > 0 && (
          <p className="text-center text-gray-500">No more reviews</p>
        )}
      </div>
    </div>
  );
}
