interface StarRatingProps {
  rating: number;
  maxRating?: number;
  mode: 'display' | 'interactive';
  onChange?: (rating: number) => void;
  size?: 'small' | 'medium' | 'large';
}

export function StarRating({ 
  rating, 
  maxRating = 10, 
  mode, 
  onChange, 
  size = 'medium' 
}: StarRatingProps) {
  const numStars = 5; // Always display 5 visual stars
  const pointsPerStar = maxRating / numStars; // 10 / 5 = 2 points per star
  
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  const handleClick = (starIndex: number) => {
    if (mode === 'interactive' && onChange) {
      const newRating = (starIndex + 1) * pointsPerStar;
      onChange(newRating);
    }
  };

  const handleHover = (starIndex: number) => {
    if (mode === 'interactive' && onChange) {
      const newRating = (starIndex + 1) * pointsPerStar;
      onChange(newRating);
    }
  };

  const getStarFillPercentage = (starIndex: number): number => {
    const starValue = (starIndex + 1) * pointsPerStar;
    const previousStarValue = starIndex * pointsPerStar;
    
    if (rating >= starValue) {
      return 100; // Full star
    } else if (rating > previousStarValue) {
      // Partial star
      const percentage = ((rating - previousStarValue) / pointsPerStar) * 100;
      return Math.max(0, Math.min(100, percentage));
    }
    return 0; // Empty star
  };

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: numStars }).map((_, index) => {
        const fillPercentage = getStarFillPercentage(index);
        
        return (
          <div
            key={index}
            className={`relative ${sizeClasses[size]} ${mode === 'interactive' ? 'cursor-pointer' : ''}`}
            onClick={() => handleClick(index)}
            onMouseEnter={() => handleHover(index)}
          >
            {/* Background (empty) star */}
            <svg
              className="absolute inset-0 text-gray-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            
            {/* Foreground (filled) star */}
            {fillPercentage > 0 && (
              <svg
                className="absolute inset-0 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 24 24"
                style={{
                  clipPath: `inset(0 ${100 - fillPercentage}% 0 0)`
                }}
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            )}
          </div>
        );
      })}
      
      {mode === 'display' && (
        <span className={`ml-1 text-gray-300 ${
          size === 'small' ? 'text-xs' : size === 'medium' ? 'text-sm' : 'text-base'
        }`}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
