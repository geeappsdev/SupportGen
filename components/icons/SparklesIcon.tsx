import React from 'react';

interface IconProps {
  className?: string;
}

export const SparklesIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M9 3v4M7 5h4M15 3v4M13 5h4M19 3v4M17 5h4M5 11v4M3 13h4M9 11v4M7 13h4M15 11v4M13 13h4M19 11v4M17 13h4M5 19v4M3 21h4M9 19v4M7 21h4M15 19v4M13 21h4M19 19v4M17 21h4" />
    </svg>
);
