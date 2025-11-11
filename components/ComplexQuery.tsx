import React, { useState, useCallback } from 'react';
import { marked } from 'marked';
import { generateComplexQueryStream } from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon';
import { LoadingSpinner } from './icons/LoadingSpinner';
import { BlinkingCursor } from './BlinkingCursor';

const ComplexQuery: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [output, setOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setOutput('');
        try {
            const stream = generateComplexQueryStream(prompt);
            for await (const chunk of stream) {
                setOutput(prev => prev + chunk);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey && !isLoading && prompt.trim()) {
            event.preventDefault();
            handleGenerate();
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 cartoon-card flex flex-col space-y-6 h-full">
            <div id="walkthrough-complex-query-input">
                <label htmlFor="complex-prompt" className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Enter your complex query</label>
                <div className="flex flex-col relative">
                    <textarea id="complex-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask a complex question, provide a long document to summarize..." className="w-full bg-gray-50 rounded-xl p-3 cartoon-input" rows={12} />
                    <div className="text-xs text-gray-500 pt-2 flex items-center gap-1.5">
                        <SparklesIcon className="w-3 h-3 text-blue-500" />
                        <span>Using a powerful AI model with enhanced thinking mode.</span>
                    </div>
                </div>
            </div>
            <div className="pt-4 border-t-2 border-gray-200">
                <button onClick={handleGenerate} disabled={isLoading || !prompt.trim()} className="w-full flex items-center justify-center bg-blue-500 text-white font-bold py-3 px-4 rounded-xl cartoon-button">
                    {isLoading ? <><LoadingSpinner /> Generating...</> : 'Generate Response'}
                </button>
            </div>
            <div className="flex-grow flex flex-col border-t-2 border-gray-200 pt-4 min-h-0">
                <h2 className="text-lg font-bold text-gray-800 mb-2">Response</h2>
                <div className="p-4 bg-gray-100 rounded-xl flex-grow overflow-y-auto">
                    {isLoading && !output && (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <LoadingSpinner />
                            <p className="ml-2">The AI is thinking deeply...</p>
                        </div>
                    )}
                    {error && (
                        <div className="text-red-600 bg-red-100 p-4 rounded-xl">
                            <p className="font-bold">Error:</p>
                            <p>{error}</p>
                        </div>
                    )}
                    {output && <div className="prose prose-sm prose-custom max-w-none" dangerouslySetInnerHTML={{ __html: marked.parse(output) as string }} />}
                    {isLoading && output && <BlinkingCursor />}
                </div>
            </div>
        </div>
    );
};

export default ComplexQuery;