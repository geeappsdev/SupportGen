import React, { useState, useCallback } from 'react';
import { marked } from 'marked';
import { generateWebAssistantResponse } from '../services/geminiService';
import { Source } from '../types';
import { LoadingSpinner } from './icons/LoadingSpinner';
import { SearchIcon } from './icons/SearchIcon';

const WebAssistant: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [output, setOutput] = useState('');
    const [sources, setSources] = useState<Source[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) {
            setError('Please enter a question or topic.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setOutput('');
        setSources([]);
        try {
            const response = await generateWebAssistantResponse(prompt);
            setOutput(response.text);
            setSources(response.candidates?.[0]?.groundingMetadata?.groundingChunks || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt]);

    return (
        <div className="bg-white rounded-2xl p-6 cartoon-card flex flex-col space-y-6 h-full">
            <div id="walkthrough-web-assistant-input">
                <label htmlFor="web-prompt" className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Ask anything...</label>
                <div className="flex gap-4">
                    <input
                        id="web-prompt"
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !isLoading) { e.preventDefault(); handleGenerate(); } }}
                        placeholder="e.g., Who won the latest F1 race?"
                        className="w-full bg-gray-50 rounded-xl p-3 cartoon-input"
                    />
                    <button onClick={handleGenerate} disabled={isLoading || !prompt.trim()} className="flex-shrink-0 flex items-center justify-center bg-blue-500 text-white font-bold py-3 px-4 rounded-xl cartoon-button">
                        {isLoading ? <LoadingSpinner /> : <SearchIcon className="w-5 h-5" />}
                    </button>
                </div>
                <div className="text-xs text-gray-500 pt-2 flex items-center gap-1.5">
                    <SearchIcon className="w-3 h-3 text-blue-500" />
                    <span>Powered by Google Search for up-to-date information.</span>
                </div>
            </div>
            <div className="flex-grow flex flex-col border-t-2 border-gray-200 pt-6 mt-6 min-h-0">
                <h2 className="text-lg font-bold text-gray-800 mb-2">Response</h2>
                <div className="p-4 bg-gray-100 rounded-xl flex-grow overflow-y-auto">
                    {isLoading && (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <LoadingSpinner />
                            <p className="ml-2">Searching the web...</p>
                        </div>
                    )}
                    {error && (
                        <div className="text-red-600 bg-red-100 p-4 rounded-xl">
                            <p className="font-bold">Error:</p>
                            <p>{error}</p>
                        </div>
                    )}
                    {!isLoading && !error && !output && (
                        <div className="text-center text-gray-500 flex items-center justify-center h-full">
                            <p>Web-grounded answers will appear here.</p>
                        </div>
                    )}
                    {output && (
                        <div>
                            <div className="prose prose-sm prose-custom max-w-none" dangerouslySetInnerHTML={{ __html: marked.parse(output) as string }} />
                            {sources.length > 0 && (
                                <div className="mt-6 border-t border-gray-200 pt-4">
                                    <h3 className="text-sm font-semibold text-gray-500 mb-2">Sources:</h3>
                                    <ul className="list-none p-0 space-y-2">
                                        {sources.map((source, index) => (
                                            <li key={index} className="text-xs">
                                                <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500 hover:underline flex items-center gap-2">
                                                    <span>{`${index + 1}.`}</span>
                                                    <span>{source.web.title || source.web.uri}</span>
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WebAssistant;