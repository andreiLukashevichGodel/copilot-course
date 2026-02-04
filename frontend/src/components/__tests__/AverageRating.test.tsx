import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '../../test/test-utils';
import { AverageRating } from '../AverageRating';
import { reviewService } from '../../services/reviewService';
import '@testing-library/jest-dom';

vi.mock('../../services/reviewService', () => ({
  reviewService: {
    getMovieStats: vi.fn()
  }
}));

describe('AverageRating', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display rating with correct formatting', async () => {
    vi.mocked(reviewService.getMovieStats).mockResolvedValueOnce({
      averageRating: 8.5,
      reviewCount: 10
    });

    render(<AverageRating imdbId="tt0111161" />);

    await waitFor(() => {
      expect(screen.getByText(/8\.5/)).toBeInTheDocument();
      expect(screen.getByText(/10 reviews/)).toBeInTheDocument();
    });
  });

  it('should display singular review text for 1 review', async () => {
    vi.mocked(reviewService.getMovieStats).mockResolvedValueOnce({
      averageRating: 9.0,
      reviewCount: 1
    });

    render(<AverageRating imdbId="tt0111161" />);

    await waitFor(() => {
      expect(screen.getByText(/9\.0/)).toBeInTheDocument();
      expect(screen.getByText(/1 review/)).toBeInTheDocument();
    });
  });

  it('should display no rating message when rating is zero', async () => {
    vi.mocked(reviewService.getMovieStats).mockResolvedValueOnce({
      averageRating: 0,
      reviewCount: 0
    });

    render(<AverageRating imdbId="tt0111161" />);

    await waitFor(() => {
      expect(screen.getByText(/No ratings yet/)).toBeInTheDocument();
    });
  });

  it('should round rating to one decimal place', async () => {
    vi.mocked(reviewService.getMovieStats).mockResolvedValueOnce({
      averageRating: 8.567,
      reviewCount: 5
    });

    render(<AverageRating imdbId="tt0111161" />);

    await waitFor(() => {
      expect(screen.getByText(/8\.6/)).toBeInTheDocument();
    });
  });

  it('should display zero reviews correctly', async () => {
    vi.mocked(reviewService.getMovieStats).mockResolvedValueOnce({
      averageRating: 0,
      reviewCount: 0
    });

    render(<AverageRating imdbId="tt0111161" />);

    await waitFor(() => {
      expect(screen.getByText(/No ratings yet/)).toBeInTheDocument();
    });
  });

  it('should handle maximum rating', async () => {
    vi.mocked(reviewService.getMovieStats).mockResolvedValueOnce({
      averageRating: 10.0,
      reviewCount: 100
    });

    render(<AverageRating imdbId="tt0111161" />);

    await waitFor(() => {
      expect(screen.getByText(/10\.0/)).toBeInTheDocument();
      expect(screen.getByText(/100 reviews/)).toBeInTheDocument();
    });
  });

  it('should handle minimum rating', async () => {
    vi.mocked(reviewService.getMovieStats).mockResolvedValueOnce({
      averageRating: 1.0,
      reviewCount: 1
    });

    render(<AverageRating imdbId="tt0111161" />);

    await waitFor(() => {
      expect(screen.getByText(/1\.0/)).toBeInTheDocument();
    });
  });
});
