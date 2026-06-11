import React from 'react';

export default function StarRating({ rating, count }) {
  const stars = Math.round(rating * 2) / 2;
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => {
          const filled = i <= Math.floor(stars);
          const half = !filled && i === Math.ceil(stars) && stars % 1 !== 0;
          return (
            <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="none">
              {filled ? (
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill="#FF9500" />
              ) : half ? (
                <>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77V2z" fill="#FF9500" />
                  <path d="M12 2v15.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#E5E5EA" />
                </>
              ) : (
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill="#E5E5EA" />
              )}
            </svg>
          );
        })}
      </div>
      <span className="text-xs font-medium" style={{ color: '#1D1D1F' }}>{rating}</span>
      <span className="text-xs" style={{ color: '#C7C7CC' }}>({count})</span>
    </div>
  );
}
