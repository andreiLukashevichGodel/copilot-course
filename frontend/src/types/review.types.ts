export interface Review {
  id: number;
  userId: number;
  userEmail: string;
  imdbId: string;
  rating: number;
  reviewText: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateReviewRequest {
  imdbId: string;
  rating: number;
  reviewText?: string;
}

export interface MovieStatsResponse {
  averageRating: number;
  reviewCount: number;
}

export interface GetMovieReviewsResponse {
  reviews: Review[];
  hasMore: boolean;
}

export interface GetMyReviewsResponse {
  reviews: Review[];
}
