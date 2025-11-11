import React from 'react';
import { SupportIcon } from './SupportIcon';
import { ImageIcon } from './icons/ImageIcon';
import { GridIcon } from './icons/GridIcon';
import { SearchIcon } from './icons/SearchIcon';
import { ChatIcon } from './icons/ChatIcon';
import { QuestionMarkIcon } from './icons/QuestionMarkIcon';

interface HeaderProps {
    activeMode: string;
    onSetMode: (mode: string) => void;
    user: string | null;
    onLogout: () => void;
    onStartWalkthrough: () => void;
}

const MODES = [
    { id: 'SUPPORT', name: 'Support Gen', icon: <SupportIcon /> },
    { id: 'IMAGE', name: 'Image Analyzer', icon: <ImageIcon /> },
    { id: 'COMPLEX', name: 'Complex Query', icon: <GridIcon /> },
    { id: 'WEB', name: 'Web Assistant', icon: <SearchIcon /> },
    { id: 'CHAT', name: 'Chat Bot', icon: <ChatIcon /> },
];

const Header: React.FC<HeaderProps> = ({ activeMode, onSetMode, user, onLogout, onStartWalkthrough }) => {
    return (
        <header className="bg-white/80 backdrop-blur-sm border-b-4 border-gray-800 sticky top-0 z-10">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <nav id="walkthrough-mode-switcher" className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto -mb-px">
                        {MODES.map(mode => (
                            <button
                                key={mode.id}
                                onClick={() => onSetMode(mode.id)}
                                className={`flex items-center space-x-2 px-3 py-3 text-sm font-bold border-b-4 transition-colors whitespace-nowrap ${
                                    activeMode === mode.id
                                        ? 'border-blue-500 text-blue-500'
                                        : 'border-transparent text-gray-500 hover:text-blue-500 hover:border-gray-300'
                                }`}
                            >
                                {mode.icon}
                                <span>{mode.name}</span>
                            </button>
                        ))}
                    </nav>
                    {user && (
                         <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium text-gray-600 hidden sm:block">Welcome, <strong className="font-bold">{user}</strong>!</span>
                            <button
                                id="walkthrough-help-button"
                                onClick={onStartWalkthrough}
                                className="text-sm bg-gray-200 hover:bg-blue-200 hover:text-blue-700 text-gray-700 font-bold py-2 px-3 rounded-lg transition-colors border-2 border-gray-800 flex items-center gap-1.5"
                                aria-label="Open application walkthrough"
                            >
                                <QuestionMarkIcon className="w-4 h-4" />
                                <span className="hidden md:inline">Help</span>
                            </button>
                            <button
                                onClick={onLogout}
                                className="text-sm bg-gray-200 hover:bg-red-200 hover:text-red-700 text-gray-700 font-bold py-2 px-3 rounded-lg transition-colors border-2 border-gray-800"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;