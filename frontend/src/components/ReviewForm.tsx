import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { reviewService } from '../services/reviewService';
import { Review } from '../types/review.types';
import { StarRating } from './StarRating';

interface ReviewFormProps {
  imdbId: string;
  existingReview?: Review | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ReviewForm({ imdbId, existingReview, onSuccess, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [reviewText, setReviewText] = useState(existingReview?.reviewText || '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setReviewText(existingReview.reviewText || '');
    }
  }, [existingReview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (rating < 1 || rating > 10) {
      setError('Please select a rating between 1 and 10');
      return;
    }

    if (reviewText.trim() && reviewText.trim().length < 10) {
      setError('Review text must be at least 10 characters');
      return;
    }

    if (reviewText.length > 2000) {
      setError('Review text cannot exceed 2000 characters');
      return;
    }

    setSubmitting(true);

    try {
      await reviewService.createOrUpdateReview({
        imdbId,
        rating,
        reviewText: reviewText.trim() || undefined
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const charCount = reviewText.length;
  const hasTextError = reviewText.trim() && reviewText.trim().length < 10;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-white font-semibold mb-2">
          Your Rating <span className="text-red-400">*</span>
        </label>
        <StarRating
          rating={rating}
          mode="interactive"
          size="large"
          onChange={setRating}
        />
        {rating > 0 && (
          <p className="text-gray-400 text-sm mt-1">{rating}/10</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-white font-semibold">
            Your Review (Optional)
          </label>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-purple-400 hover:text-purple-300 text-sm"
          >
            {showPreview ? 'Edit' : 'Preview'}
          </button>
        </div>

        {!showPreview ? (
          <>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg p-3 min-h-[150px] focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="Share your thoughts about this movie... (Supports Markdown: **bold** *italic* - list [link](url))"
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-gray-400 text-xs">
                Markdown supported: **bold** *italic* - list [link](url)
              </p>
              <p className={`text-sm ${charCount > 2000 ? 'text-red-400' : 'text-gray-400'}`}>
                {charCount}/2000
              </p>
            </div>
            {hasTextError && (
              <p className="text-red-400 text-sm mt-1">
                Review text must be at least 10 characters
              </p>
            )}
          </>
        ) : (
          <div className="bg-gray-700 rounded-lg p-3 min-h-[150px]">
            {reviewText.trim() ? (
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {reviewText}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-gray-500 italic">No review text to preview</p>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 text-gray-300 hover:text-white transition"
          disabled={submitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={submitting || rating === 0}
        >
          {submitting ? 'Saving...' : existingReview ? 'Update Review' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
}
