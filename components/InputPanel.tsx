import React, { useState, useEffect } from 'react';
import FormatSelector from './FormatSelector';
import { SettingsIcon } from './icons/SettingsIcon';
import { LoadingSpinner } from './icons/LoadingSpinner';
import { countTokens } from '../services/geminiService';

interface InputPanelProps {
    userInput: string;
    setUserInput: (value: string) => void;
    selectedFormats: string[];
    setSelectedFormats: (formats: string[]) => void;
    onGenerate: () => void;
    isLoading: boolean;
    onOpenSettings: () => void;
    isClearDisabled: boolean;
    onClearAll: () => void;
}

const InputPanel: React.FC<InputPanelProps> = ({
    userInput, setUserInput, selectedFormats, setSelectedFormats, onGenerate, isLoading, onOpenSettings, isClearDisabled, onClearAll,
}) => {
    const [tokenCount, setTokenCount] = useState(0);
    const [isCountingTokens, setIsCountingTokens] = useState(false);

    useEffect(() => {
        if (!userInput.trim()) {
            setTokenCount(0);
            setIsCountingTokens(false);
            return;
        }

        setIsCountingTokens(true);
        const handler = setTimeout(() => {
            countTokens(userInput).then(count => {
                setTokenCount(count);
                setIsCountingTokens(false);
            });
        }, 500); // 500ms debounce

        return () => {
            clearTimeout(handler);
        };
    }, [userInput]);

    const isGenerateDisabled = isLoading || !userInput.trim() || selectedFormats.length === 0;
    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => { 
        if (event.key === 'Enter' && !event.shiftKey) { 
            event.preventDefault(); 
            if (!isGenerateDisabled) onGenerate(); 
        } 
    };

    return (
        <div id="walkthrough-input-panel" className="bg-white rounded-2xl p-6 cartoon-card flex flex-col space-y-6 h-full">
            <div className="flex-grow flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-2">
                    <label htmlFor="userInput" className="block text-xs font-bold uppercase tracking-wider text-gray-600">Case Context & User Prompt</label>
                    <button
                        onClick={onOpenSettings} 
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors font-semibold" 
                        aria-label="Customize system prompt"
                    >
                        <SettingsIcon className="w-4 h-4" />
                        <span>Customize Rules</span>
                    </button>
                </div>
                <div id="walkthrough-context-input" className="relative w-full flex-grow">
                    <textarea
                        id="userInput" 
                        value={userInput} 
                        onChange={(e) => setUserInput(e.target.value)} 
                        onKeyDown={handleKeyDown}
                        placeholder="Paste the user's issue, case notes, or any relevant context here..."
                        className="w-full h-full bg-gray-50 rounded-xl p-3 pr-10 pb-8 text-gray-800 placeholder-gray-400 cartoon-input resize-y"
                        rows={10} 
                        autoFocus
                    />
                    {userInput && (
                        <button
                            onClick={() => setUserInput('')}
                            className="absolute top-2.5 right-2.5 p-1 text-gray-400 hover:text-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-blue-500 transition-colors"
                            aria-label="Clear input"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </button>
                    )}
                    <div className="absolute bottom-2.5 right-3.5 text-xs text-gray-500 pointer-events-none">
                      {isCountingTokens ? 'Counting...' : `${tokenCount} tokens`}
                    </div>
                </div>
            </div>
            <div id="walkthrough-format-selector">
                <FormatSelector selectedFormats={selectedFormats} setSelectedFormats={setSelectedFormats} />
            </div>
            <div className="pt-4 border-t-2 border-gray-200">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onClearAll} 
                        disabled={isClearDisabled}
                        className="flex-shrink-0 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-4 rounded-xl cartoon-button"
                        aria-label="Clear all inputs and outputs"
                    >
                        Clear All
                    </button>
                    <button
                        id="walkthrough-generate-button"
                        onClick={onGenerate} 
                        disabled={isGenerateDisabled}
                        className="w-full flex items-center justify-center bg-blue-500 text-white font-bold py-3 px-4 rounded-xl cartoon-button"
                    >
                        {isLoading ? <><LoadingSpinner />Generating...</> : 'Generate Response'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InputPanel;