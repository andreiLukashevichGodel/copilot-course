import { useState, useEffect } from 'react';
import { reviewService } from '../services/reviewService';
import { StarRating } from './StarRating';

interface AverageRatingProps {
  imdbId: string;
  size?: 'small' | 'medium' | 'large';
}

export function AverageRating({ imdbId, size = 'medium' }: AverageRatingProps) {
  const [averageRating, setAverageRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await reviewService.getMovieStats(imdbId);
        setAverageRating(stats.averageRating);
        setReviewCount(stats.reviewCount);
      } catch (error) {
        console.error('Failed to fetch movie stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [imdbId]);

  if (loading) {
    return null;
  }

  if (reviewCount === 0) {
    return (
      <div className="flex items-center gap-1 text-gray-400 text-xs">
        <span>No ratings yet</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <StarRating 
        rating={averageRating} 
        mode="display" 
        size={size} 
      />
      <span className="text-gray-400 text-xs">
        ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
      </span>
    </div>
  );
}
