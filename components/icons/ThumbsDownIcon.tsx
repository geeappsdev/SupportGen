import React from 'react';

interface IconProps {
  className?: string;
}

export const ThumbsDownIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${className}`} viewBox="0 0 20 20" fill="currentColor">
        <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667V3a1 1 0 00-1-1H6.636a1 1 0 00-.942.67l-1.7 5.1a1 1 0 00.354 1.165l2.788 2.788a1 1 0 001.414 0l1.42-1.42a1 1 0 000-1.414L8.58 9.42l1.42-1.42a1 1 0 000-1.414L8.58 5.17l1.42-1.42a1 1 0 001.414 0L12.586 5H13v5.667a1 1 0 001 1h1z" />
    </svg>
);
