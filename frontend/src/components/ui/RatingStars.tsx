import React from 'react';
import { Star } from 'lucide-react';
import { clsx } from 'clsx';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: number;
  className?: string;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxRating = 5,
  size = 16,
  className,
}) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={clsx('flex items-center', className)}>
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={`full-${i}`}
          className="text-yellow-400 fill-current"
          size={size}
        />
      ))}
      {hasHalfStar && (
        <div className="relative">
          <Star className="text-yellow-400 fill-current" size={size} />
          <div
            className="absolute top-0 left-0 overflow-hidden"
            style={{ width: '50%' }}
          >
            <Star className="text-yellow-400 fill-current" size={size} />
          </div>
          <Star className="text-gray-300" size={size} />
        </div>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star
          key={`empty-${i}`}
          className="text-gray-300"
          size={size}
        />
      ))}
    </div>
  );
};
