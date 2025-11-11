import React from 'react';

interface IconProps {
  className?: string;
}

export const ThumbsUpIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${className}`} viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333V17a1 1 0 001 1h6.364a1 1 0 00.942-.67l1.7-5.1a1 1 0 00-.354-1.165l-2.788-2.788a1 1 0 00-1.414 0l-1.42 1.42a1 1 0 000 1.414l1.42 1.42L11 14.586l-1.42-1.42a1 1 0 00-1.414 0l-1.42 1.42V10.333a1 1 0 00-1-1H6z" />
    </svg>
);
