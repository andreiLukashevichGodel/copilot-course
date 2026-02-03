import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

interface CollectionFiltersProps {
  availableGenres: string[];
  onGenresLoading?: boolean;
}

export function CollectionFilters({ availableGenres, onGenresLoading }: CollectionFiltersProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showGenres, setShowGenres] = useState(false);

  // Local state for debounced inputs
  const [localYearFrom, setLocalYearFrom] = useState('');
  const [localYearTo, setLocalYearTo] = useState('');
  const [localMinRating, setLocalMinRating] = useState('');

  // Read current filter values from URL
  const sortBy = searchParams.get('sortBy') || 'dateAdded';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  const selectedGenres = searchParams.get('filterGenres')?.split(',').filter(Boolean) || [];
  const yearFrom = searchParams.get('filterYearFrom') || '';
  const yearTo = searchParams.get('filterYearTo') || '';
  const minRating = searchParams.get('minRating') || '';

  // Initialize local state from URL params
  useEffect(() => {
    setLocalYearFrom(yearFrom);
    setLocalYearTo(yearTo);
    setLocalMinRating(minRating);
  }, []);

  // Debounce year from
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localYearFrom !== yearFrom) {
        updateFilter('filterYearFrom', localYearFrom);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localYearFrom]);

  // Debounce year to
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localYearTo !== yearTo) {
        updateFilter('filterYearTo', localYearTo);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localYearTo]);

  // Debounce min rating
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localMinRating !== minRating) {
        updateFilter('minRating', localMinRating);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localMinRating]);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Reset to page 1 when filters change
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const toggleGenre = (genre: string) => {
    let newGenres: string[];
    if (selectedGenres.includes(genre)) {
      newGenres = selectedGenres.filter(g => g !== genre);
    } else {
      newGenres = [...selectedGenres, genre];
    }
    updateFilter('filterGenres', newGenres.join(','));
  };

  const clearAllFilters = () => {
    const newParams = new URLSearchParams();
    newParams.set('page', '1');
    setSearchParams(newParams);
    setLocalYearFrom('');
    setLocalYearTo('');
    setLocalMinRating('');
  };

  const hasActiveFilters = 
    selectedGenres.length > 0 || 
    localYearFrom || 
    localYearTo || 
    localMinRating || 
    sortBy !== 'dateAdded' || 
    sortOrder !== 'desc';

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        {/* Sort By */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-300 mb-1">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
          >
            <option value="dateAdded">Date Added</option>
            <option value="title">Title</option>
            <option value="year">Year</option>
            <option value="rating">Rating</option>
          </select>
        </div>

        {/* Sort Order */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-300 mb-1">Order</label>
          <select
            value={sortOrder}
            onChange={(e) => updateFilter('sortOrder', e.target.value)}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        {/* Year From */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-300 mb-1">Year From</label>
          <input
            type="number"
            placeholder="e.g. 2000"
            value={localYearFrom}
            onChange={(e) => setLocalYearFrom(e.target.value)}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Year To */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-300 mb-1">Year To</label>
          <input
            type="number"
            placeholder="e.g. 2024"
            value={localYearTo}
            onChange={(e) => setLocalYearTo(e.target.value)}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Min Rating */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-300 mb-1">Min Rating</label>
          <input
            type="number"
            placeholder="1-10"
            min="1"
            max="10"
            step="0.1"
            value={localMinRating}
            onChange={(e) => setLocalMinRating(e.target.value)}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Genre Filters */}
      <div className="mb-4">
        <button
          onClick={() => setShowGenres(!showGenres)}
          className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white mb-2"
        >
          <svg
            className={`w-4 h-4 transform transition-transform ${showGenres ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Filter by Genre {selectedGenres.length > 0 && `(${selectedGenres.length})`}
        </button>

        {showGenres && (
          <div className="flex flex-wrap gap-2">
            {onGenresLoading ? (
              <span className="text-gray-400 text-sm">Loading genres...</span>
            ) : availableGenres.length === 0 ? (
              <span className="text-gray-400 text-sm">No genres available</span>
            ) : (
              availableGenres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                    selectedGenres.includes(genre)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {genre}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear All Filters
        </button>
      )}
    </div>
  );
}
