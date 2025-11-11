import React from 'react';
import { RESPONSE_FORMATS } from '../constants';

interface FormatSelectorProps {
    selectedFormats: string[];
    setSelectedFormats: (formats: string[]) => void;
}

const FormatSelector: React.FC<FormatSelectorProps> = ({ selectedFormats, setSelectedFormats }) => {
    const handleFormatClick = (formatId: string) => {
        const newFormats = selectedFormats.includes(formatId) 
            ? selectedFormats.filter(id => id !== formatId) 
            : [...selectedFormats, formatId];
        setSelectedFormats(newFormats);
    };

    return (
        <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-3">Select Output Format(s)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {RESPONSE_FORMATS.map((format) => (
                    <button
                        key={format.id}
                        onClick={() => handleFormatClick(format.id)}
                        className={`relative text-left p-3 rounded-xl border-2 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-500 ${
                            selectedFormats.includes(format.id)
                                ? 'bg-amber-300 border-gray-800 text-gray-900 font-bold'
                                : 'bg-white border-gray-800 hover:bg-amber-100 text-gray-800'
                        }`}
                        aria-pressed={selectedFormats.includes(format.id)}
                    >
                        {selectedFormats.includes(format.id) && (
                            <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-gray-800 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        )}
                        <p className="font-bold text-sm">{format.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{format.description}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default FormatSelector;
