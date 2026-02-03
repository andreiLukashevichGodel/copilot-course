import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Review } from '../types/review.types';
import { StarRating } from './StarRating';
import { ReviewForm } from './ReviewForm';

interface ReviewCardProps {
  review: Review;
  isOwnReview: boolean;
  onUpdate: () => void;
  onDelete: () => void;
}

export function ReviewCard({ review, isOwnReview, onUpdate, onDelete }: ReviewCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
    onUpdate();
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    onDelete();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (isEditing) {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 ${isOwnReview ? 'border-2 border-purple-600' : ''}`}>
        <ReviewForm
          imdbId={review.imdbId}
          existingReview={review}
          onSuccess={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-lg p-6 ${isOwnReview ? 'border-2 border-purple-600' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {review.userEmail.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-white font-semibold">{review.userEmail}</p>
            <div className="flex items-center gap-2">
              <StarRating rating={review.rating} mode="display" size="small" />
            </div>
          </div>
        </div>
        {isOwnReview && (
          <div className="flex gap-2">
            <button
              onClick={handleEditClick}
              className="text-purple-400 hover:text-purple-300 text-sm px-3 py-1 rounded border border-purple-600 hover:bg-purple-600/20 transition"
            >
              Edit
            </button>
            <button
              onClick={handleDeleteClick}
              className="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded border border-red-600 hover:bg-red-600/20 transition"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {review.reviewText && (
        <div className="prose prose-invert prose-sm max-w-none mb-4">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {review.reviewText}
          </ReactMarkdown>
        </div>
      )}

      <div className="text-gray-400 text-sm">
        {formatDate(review.createdAt)}
        {review.updatedAt && (
          <span className="ml-2 text-gray-500">
            • Edited {formatDate(review.updatedAt)}
          </span>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Delete Review?</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this review? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-300 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
