import {
  Review,
  CreateReviewRequest,
  MovieStatsResponse,
  GetMovieReviewsResponse,
  GetMyReviewsResponse
} from '../types/review.types';

const API_BASE_URL = 'http://localhost:5000/api';

export const reviewService = {
  async createOrUpdateReview(review: CreateReviewRequest): Promise<Review> {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(review)
    });
    
    if (!response.ok) {
      const text = await response.text();
      let error;
      try {
        error = text ? JSON.parse(text) : {};
      } catch {
        error = { message: 'Failed to submit review' };
      }
      throw new Error(error.message || 'Failed to submit review');
    }
    
    return response.json();
  },

  async getMyReview(imdbId: string): Promise<Review | null> {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}/reviews/movies/${imdbId}/my-review`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const text = await response.text();
      let error;
      try {
        error = text ? JSON.parse(text) : {};
      } catch {
        error = { message: 'Failed to fetch your review' };
      }
      throw new Error(error.message || 'Failed to fetch your review');
    }
    
    return response.json();
  },

  async getMovieReviews(imdbId: string, skip: number = 0, take: number = 20): Promise<GetMovieReviewsResponse> {
    const response = await fetch(`${API_BASE_URL}/reviews/movies/${imdbId}?skip=${skip}&take=${take}`);
    
    if (!response.ok) {
      const text = await response.text();
      let error;
      try {
        error = text ? JSON.parse(text) : {};
      } catch {
        error = { message: 'Failed to fetch reviews' };
      }
      throw new Error(error.message || 'Failed to fetch reviews');
    }
    
    return response.json();
  },

  async getMyReviews(): Promise<GetMyReviewsResponse> {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}/reviews/my-reviews`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const text = await response.text();
      let error;
      try {
        error = text ? JSON.parse(text) : {};
      } catch {
        error = { message: 'Failed to fetch your reviews' };
      }
      throw new Error(error.message || 'Failed to fetch your reviews');
    }
    
    return response.json();
  },

  async deleteReview(imdbId: string): Promise<void> {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}/reviews/${imdbId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const text = await response.text();
      let error;
      try {
        error = text ? JSON.parse(text) : {};
      } catch {
        error = { message: 'Failed to delete review' };
      }
      throw new Error(error.message || 'Failed to delete review');
    }
  },

  async getMovieStats(imdbId: string): Promise<MovieStatsResponse> {
    const response = await fetch(`${API_BASE_URL}/reviews/movies/${imdbId}/stats`);
    
    if (!response.ok) {
      const text = await response.text();
      let error;
      try {
        error = text ? JSON.parse(text) : {};
      } catch {
        error = { message: 'Failed to fetch movie stats' };
      }
      throw new Error(error.message || 'Failed to fetch movie stats');
    }
    
    return response.json();
  }
};
