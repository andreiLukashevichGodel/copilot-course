import {
  Collection,
  CollectionMovie,
  AddMovieToCollectionRequest,
  GetCollectionsResponse,
  GetCollectionMoviesResponse,
  GetMovieCollectionsResponse,
  CollectionFilters,
  GetCollectionGenresResponse,
  DashboardStats
} from '../types/library.types';

const API_BASE_URL = 'http://localhost:5000/api';

export const libraryService = {
  async createCollection(name: string): Promise<Collection> {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_BASE_URL}/library/collections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name })
    });
    
    if (!response.ok) {
      const text = await response.text();
      let error;
      try {
        error = text ? JSON.parse(text) : {};
      } catch {
        error = { message: 'Failed to create collection' };
      }
      throw new Error(error.message || 'Failed to create collection');
    }
    
    return response.json();
  },

  async getCollections(): Promise<GetCollectionsResponse> {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}/library/collections`, {
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
        error = { message: 'Failed to fetch collections' };
      }
      throw new Error(error.message || 'Failed to fetch collections');
    }
    
    return response.json();
  },

  async addMovieToCollection(collectionId: number, movie: AddMovieToCollectionRequest): Promise<CollectionMovie> {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}/library/collections/${collectionId}/movies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(movie)
    });
    
    if (!response.ok) {
      const text = await response.text();
      let error;
      try {
        error = text ? JSON.parse(text) : {};
      } catch {
        error = { message: 'Failed to add movie to collection' };
      }
      throw new Error(error.message || 'Failed to add movie to collection');
    }
    
    return response.json();
  },

  async removeMovieFromCollection(collectionId: number, imdbId: string): Promise<void> {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}/library/collections/${collectionId}/movies/${imdbId}`, {
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
        error = { message: 'Failed to remove movie from collection' };
      }
      throw new Error(error.message || 'Failed to remove movie from collection');
    }
  },

  async getCollectionMovies(collectionId: number, filters?: CollectionFilters): Promise<GetCollectionMoviesResponse> {
    const token = localStorage.getItem('authToken');
    
    // Build query params
    const params = new URLSearchParams();
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters?.filterGenres) params.append('filterGenres', filters.filterGenres);
    if (filters?.filterYearFrom) params.append('filterYearFrom', filters.filterYearFrom.toString());
    if (filters?.filterYearTo) params.append('filterYearTo', filters.filterYearTo.toString());
    if (filters?.minRating) params.append('minRating', filters.minRating.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());
    
    const queryString = params.toString();
    const url = `${API_BASE_URL}/library/collections/${collectionId}/movies${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
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
        error = { message: 'Failed to fetch collection movies' };
      }
      throw new Error(error.message || 'Failed to fetch collection movies');
    }
    
    return response.json();
  },

  async getCollectionGenres(collectionId: number): Promise<GetCollectionGenresResponse> {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}/library/collections/${collectionId}/genres`, {
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
        error = { message: 'Failed to fetch collection genres' };
      }
      throw new Error(error.message || 'Failed to fetch collection genres');
    }
    
    return response.json();
  },

  async deleteCollection(collectionId: number): Promise<void> {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}/library/collections/${collectionId}`, {
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
        error = { message: 'Failed to delete collection' };
      }
      throw new Error(error.message || 'Failed to delete collection');
    }
  },

  async getMovieCollections(imdbId: string): Promise<GetMovieCollectionsResponse> {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}/library/movies/${imdbId}/collections`, {
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
        error = { message: 'Failed to fetch movie collections' };
      }
      throw new Error(error.message || 'Failed to fetch movie collections');
    }
    
    return response.json();
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}/library/dashboard/stats`, {
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
        error = { message: 'Failed to fetch dashboard stats' };
      }
      throw new Error(error.message || 'Failed to fetch dashboard stats');
    }
    
    return response.json();
  }
};
