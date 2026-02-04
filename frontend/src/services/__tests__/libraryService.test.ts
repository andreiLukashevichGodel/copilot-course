import { describe, it, expect, beforeEach, vi } from 'vitest';
import { libraryService } from '../libraryService';
import { mockCollections, mockCollectionMovies, mockDashboardStats } from '../../test/mockData';

globalThis.fetch = vi.fn() as any;

describe('libraryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('authToken', 'mock-token');
  });

  describe('getCollections', () => {
    it('should fetch collections successfully', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ collections: mockCollections })
      });

      const result = await libraryService.getCollections();

      expect(result.collections).toHaveLength(2);
      expect(result.collections[0].name).toBe('Action Movies');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/library/collections'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token'
          })
        })
      );
    });

    it('should throw error when fetch fails', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        text: async () => JSON.stringify({ message: 'Unauthorized' })
      });

      await expect(libraryService.getCollections()).rejects.toThrow('Unauthorized');
    });
  });

  describe('createCollection', () => {
    it('should create collection with name', async () => {
      const newCollection = mockCollections[0];
      
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => newCollection
      });

      const result = await libraryService.createCollection('Action Movies');

      expect(result.name).toBe('Action Movies');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/library/collections'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token',
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({ name: 'Action Movies' })
        })
      );
    });
  });

  describe('getCollectionMovies', () => {
    it('should fetch collection movies without filters', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          movies: mockCollectionMovies,
          totalCount: 2,
          totalPages: 1,
          currentPage: 1
        })
      });

      const result = await libraryService.getCollectionMovies(1);

      expect(result.movies).toHaveLength(2);
      expect(result.totalCount).toBe(2);
    });

    it('should fetch collection movies with filters', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          movies: [mockCollectionMovies[0]],
          totalCount: 1,
          totalPages: 1,
          currentPage: 1
        })
      });

      const result = await libraryService.getCollectionMovies(1, {
        sortBy: 'title',
        sortOrder: 'asc',
        filterGenres: 'Drama',
        minRating: 9,
        page: 1,
        pageSize: 20
      });

      expect(result.movies).toHaveLength(1);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('sortBy=title'),
        expect.any(Object)
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('filterGenres=Drama'),
        expect.any(Object)
      );
    });
  });

  describe('addMovieToCollection', () => {
    it('should add movie to collection', async () => {
      const movie = mockCollectionMovies[0];
      
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => movie
      });

      const result = await libraryService.addMovieToCollection(1, {
        imdbId: movie.imdbId,
        title: movie.title,
        year: movie.year,
        poster: movie.poster,
        type: movie.type
      });

      expect(result.title).toBe('The Shawshank Redemption');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/library/collections/1/movies'),
        expect.objectContaining({
          method: 'POST'
        })
      );
    });
  });

  describe('removeMovieFromCollection', () => {
    it('should remove movie from collection', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true
      });

      await libraryService.removeMovieFromCollection(1, 'tt0111161');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/library/collections/1/movies/tt0111161'),
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });
  });

  describe('getCollectionGenres', () => {
    it('should fetch unique genres from collection', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ genres: ['Action', 'Drama', 'Crime'] })
      });

      const result = await libraryService.getCollectionGenres(1);

      expect(result.genres).toContain('Action');
      expect(result.genres).toContain('Drama');
    });
  });

  describe('deleteCollection', () => {
    it('should delete collection', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true
      });

      await libraryService.deleteCollection(1);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/library/collections/1'),
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });
  });

  describe('getDashboardStats', () => {
    it('should fetch dashboard statistics', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDashboardStats
      });

      const result = await libraryService.getDashboardStats();

      expect(result.totalCollections).toBe(2);
      expect(result.totalMovies).toBe(5);
      expect(result.averageRating).toBe(9.2);
      expect(result.genreDistribution).toHaveLength(3);
      expect(result.ratingDistribution).toHaveLength(10);
    });
  });
});
