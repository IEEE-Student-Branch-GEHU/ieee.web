import React from 'react';

/**
 * Skeleton UI component for smooth loading states.
 * Uses Tailwind's animate-pulse for a premium, non-distracting shimmer.
 */
const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200/80 dark:bg-gray-800/80 ${className}`}
      {...props}
    />
  );
};

export { Skeleton };
