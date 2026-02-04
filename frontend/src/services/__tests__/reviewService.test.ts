import { describe, it, expect, beforeEach, vi } from 'vitest';
import { reviewService } from '../reviewService';
import { mockReviews } from '../../test/mockData';

globalThis.fetch = vi.fn() as any;

describe('reviewService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('authToken', 'mock-token');
  });

  describe('createOrUpdateReview', () => {
    it('should create a new review', async () => {
      const mockReview = mockReviews[0];
      
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockReview
      });

      const result = await reviewService.createOrUpdateReview({
        imdbId: 'tt0111161',
        rating: 10,
        reviewText: 'Amazing movie!'
      });

      expect(result.rating).toBe(10);
      expect(result.reviewText).toBe('Amazing movie!');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/reviews'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token',
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('should handle review without text', async () => {
      const reviewWithoutText = { ...mockReviews[0], reviewText: null };
      
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => reviewWithoutText
      });

      const result = await reviewService.createOrUpdateReview({
        imdbId: 'tt0111161',
        rating: 10
      });

      expect(result.rating).toBe(10);
      expect(result.reviewText).toBeNull();
    });
  });

  describe('getMyReview', () => {
    it('should fetch user review for a movie', async () => {
      const mockReview = mockReviews[0];
      
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockReview
      });

      const result = await reviewService.getMyReview('tt0111161');

      expect(result).not.toBeNull();
      expect(result!.imdbId).toBe('tt0111161');
      expect(result!.rating).toBe(10);
    });

    it('should throw error when no review exists', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => JSON.stringify({ message: 'Review not found' })
      });

      await expect(reviewService.getMyReview('tt9999999')).rejects.toThrow('Review not found');
    });
  });

  describe('getMovieReviews', () => {
    it('should fetch all reviews for a movie', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ reviews: mockReviews })
      });

      const result = await reviewService.getMovieReviews('tt0111161');

      expect(result.reviews).toHaveLength(2);
      expect(result.reviews[0].imdbId).toBe('tt0111161');
    });

    it('should return empty array when no reviews exist', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ reviews: [] })
      });

      const result = await reviewService.getMovieReviews('tt9999999');

      expect(result.reviews).toHaveLength(0);
    });
  });

  describe('getMyReviews', () => {
    it('should fetch all user reviews', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ reviews: mockReviews })
      });

      const result = await reviewService.getMyReviews();

      expect(result.reviews).toHaveLength(2);
      expect(result.reviews.every(r => r.userEmail === 'test@example.com')).toBe(true);
    });
  });

  describe('deleteReview', () => {
    it('should delete a review', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true
      });

      await reviewService.deleteReview('tt0111161');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/reviews/tt0111161'),
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token'
          })
        })
      );
    });

    it('should throw error when delete fails', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        text: async () => JSON.stringify({ message: 'Review not found' })
      });

      await expect(reviewService.deleteReview('tt9999999')).rejects.toThrow('Review not found');
    });
  });
});
