import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { libraryService } from '../services/libraryService';
import { DashboardStats } from '../types/library.types';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadStats();
    }
  }, [isAuthenticated]);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await libraryService.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard stats');
      console.error('Error loading dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Welcome to MovieApp
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Your personal movie rating platform. Discover, rate, and share your favorite films with the world.
            </p>
            
            <div className="flex justify-center space-x-4">
              <Link
                to="/register"
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition duration-200"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg text-lg font-semibold transition duration-200"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/20 border border-red-900 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
            <button
              onClick={loadStats}
              className="mt-2 px-4 py-2 bg-red-800 hover:bg-red-700 rounded transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const maxGenreCount = Math.max(...stats.genreDistribution.map(g => g.count), 1);
  const maxRatingCount = Math.max(...stats.ratingDistribution.map(r => r.count), 1);

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="mb-8 pt-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text">
            Dashboard
          </h1>
          <p className="text-gray-400">Overview of your movie collection statistics</p>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-1">Total Collections</div>
            <div className="text-3xl font-bold text-blue-400">{stats.totalCollections}</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-1">Total Movies</div>
            <div className="text-3xl font-bold text-purple-400">{stats.totalMovies}</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-1">Total Reviews</div>
            <div className="text-3xl font-bold text-green-400">{stats.totalReviews}</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-1">Average Rating</div>
            <div className="text-3xl font-bold text-yellow-400">{stats.averageRating.toFixed(1)}</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Genre Distribution */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">Top Genres</h2>
            {stats.genreDistribution.length > 0 ? (
              <div className="flex flex-col lg:flex-row items-center gap-6">
                {/* Pie Chart */}
                <div className="flex-shrink-0">
                  <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
                    {(() => {
                      const total = stats.genreDistribution.reduce((sum, item) => sum + item.count, 0);
                      const colors = [
                        '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
                        '#06b6d4', '#6366f1', '#f43f5e', '#84cc16', '#a855f7'
                      ];
                      let currentAngle = 0;

                      return stats.genreDistribution.map((item, index) => {
                        const percentage = (item.count / total) * 100;
                        const angle = (percentage / 100) * 360;
                        const startAngle = currentAngle;
                        const endAngle = currentAngle + angle;
                        
                        // Calculate path for pie slice
                        const startRad = (startAngle * Math.PI) / 180;
                        const endRad = (endAngle * Math.PI) / 180;
                        const x1 = 100 + 90 * Math.cos(startRad);
                        const y1 = 100 + 90 * Math.sin(startRad);
                        const x2 = 100 + 90 * Math.cos(endRad);
                        const y2 = 100 + 90 * Math.sin(endRad);
                        const largeArc = angle > 180 ? 1 : 0;
                        
                        const path = `M 100 100 L ${x1} ${y1} A 90 90 0 ${largeArc} 1 ${x2} ${y2} Z`;
                        currentAngle = endAngle;

                        return (
                          <path
                            key={item.genre}
                            d={path}
                            fill={colors[index % colors.length]}
                            className="transition-opacity hover:opacity-80 cursor-pointer"
                            opacity="0.9"
                          >
                            <title>{item.genre}: {item.count} movies ({percentage.toFixed(1)}%)</title>
                          </path>
                        );
                      });
                    })()}
                  </svg>
                </div>

                {/* Legend */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {stats.genreDistribution.map((item, index) => {
                    const colors = [
                      '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
                      '#06b6d4', '#6366f1', '#f43f5e', '#84cc16', '#a855f7'
                    ];
                    const total = stats.genreDistribution.reduce((sum, g) => sum + g.count, 0);
                    const percentage = ((item.count / total) * 100).toFixed(1);
                    
                    return (
                      <div key={item.genre} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: colors[index % colors.length] }}
                        ></div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-300 truncate">{item.genre}</div>
                          <div className="text-xs text-gray-500">{item.count} ({percentage}%)</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-gray-400">No genre data available</p>
            )}
          </div>

          {/* Rating Distribution */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">Rating Distribution</h2>
            <div className="flex items-end justify-between h-48 gap-2">
              {stats.ratingDistribution.map((item) => (
                <div key={item.rating} className="flex-1 flex flex-col items-center gap-1">
                  <div className="relative w-full flex items-end justify-center" style={{ height: '150px' }}>
                    {item.count > 0 && (
                      <div
                        className="w-full bg-yellow-500 rounded-t transition-all duration-500 flex items-start justify-center pt-1"
                        style={{ height: `${(item.count / maxRatingCount) * 100}%` }}
                      >
                        <span className="text-xs text-gray-900 font-medium">{item.count}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 font-medium">{item.rating}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Additions & Top Collections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Additions */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">Recent Additions</h2>
            {stats.recentAdditions.length > 0 ? (
              <div className="space-y-3">
                {stats.recentAdditions.map((item) => (
                  <div
                    key={`${item.imdbId}-${item.addedAt}`}
                    className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/movies/${item.imdbId}`)}
                  >
                    <div>
                      <div className="font-medium text-gray-200">{item.title}</div>
                      <div className="text-sm text-gray-400">{item.year}</div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(item.addedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No movies added yet</p>
            )}
          </div>

          {/* Top Collections */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">Top Collections</h2>
            {stats.topCollections.length > 0 ? (
              <div className="space-y-3">
                {stats.topCollections.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/library/${item.id}`)}
                  >
                    <div className="font-medium text-gray-200">{item.name}</div>
                    <div className="text-sm text-gray-400">
                      {item.movieCount} {item.movieCount === 1 ? 'movie' : 'movies'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No collections created yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
