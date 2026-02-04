import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as authService from '../authService';

globalThis.fetch = vi.fn() as any;

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully and return auth response', async () => {
      const mockResponse = {
        email: 'test@example.com',
        token: 'mock-token',
        expiresAt: '2026-02-05T00:00:00Z'
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(result.email).toBe('test@example.com');
      expect(result.token).toBe('mock-token');
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123'
          })
        })
      );
    });

    it('should throw error on failed login', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Invalid credentials' })
      });

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrong-password'
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should handle network errors', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'password123'
        })
      ).rejects.toThrow('Network error');
    });

    it('should handle json parse errors gracefully', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => { throw new Error('Invalid JSON'); }
      });

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'password123'
        })
      ).rejects.toThrow('Login failed');
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      });

      await expect(
        authService.register({
          email: 'new@example.com',
          password: 'password123'
        })
      ).resolves.not.toThrow();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/auth/register',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: 'new@example.com',
            password: 'password123'
          })
        })
      );
    });

    it('should throw error when email already exists', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'User already exists' })
      });

      await expect(
        authService.register({
          email: 'existing@example.com',
          password: 'password123'
        })
      ).rejects.toThrow('User already exists');
    });

    it('should handle registration errors with default message', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => { throw new Error('Invalid JSON'); }
      });

      await expect(
        authService.register({
          email: 'test@example.com',
          password: 'password123'
        })
      ).rejects.toThrow('Registration failed');
    });
  });
});
