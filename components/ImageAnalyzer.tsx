import React, { useState, useCallback } from 'react';
import { marked } from 'marked';
import { fileToBase64 } from '../utils/imageUtils';
import { generateImageAnalysisStream } from '../services/geminiService';
import { ImageUpload } from './ImageUpload';
import { LoadingSpinner } from './icons/LoadingSpinner';
import { BlinkingCursor } from './BlinkingCursor';
import { CopyIcon } from './icons/CopyIcon';

const DEFAULT_PROMPT = "Extract all text content from this image. If the text is in a language other than English, please translate it into English. Present the final text clearly and accurately, ready for copying.";

const ImageAnalyzer: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
    const [output, setOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCleared, setIsCleared] = useState(false);

    const handleGenerate = useCallback(async () => {
        if (!imageFile || !prompt.trim()) {
            setError('Please upload an image and enter a prompt.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setOutput('');
        setIsCleared(false);
        try {
            const imageBase64 = await fileToBase64(imageFile);
            const stream = generateImageAnalysisStream(prompt, imageBase64, imageFile.type);
            for await (const chunk of stream) {
                setOutput(prev => prev + chunk);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [imageFile, prompt]);

    const handleCopyAndClear = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        
        // Clear all data from the front-end state
        setImageFile(null);
        setOutput('');
        setError(null);
        setPrompt(DEFAULT_PROMPT);
        setIsCleared(true);

        setTimeout(() => {
            setIsCleared(false);
        }, 4000);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey && !isLoading && prompt.trim() && imageFile) {
            event.preventDefault();
            handleGenerate();
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            {/* Left Panel: Inputs */}
            <div className="bg-white rounded-2xl p-6 cartoon-card flex flex-col space-y-6">
                <div id="walkthrough-image-upload">
                    <ImageUpload imageFile={imageFile} setImageFile={setImageFile} />
                </div>
                
                <div id="walkthrough-image-prompt">
                    <label htmlFor="image-prompt" className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Your Prompt</label>
                    <textarea 
                        id="image-prompt" 
                        value={prompt} 
                        onChange={(e) => setPrompt(e.target.value)} 
                        onKeyDown={handleKeyDown} 
                        placeholder="Describe what you want the AI to do with the image..." 
                        className="w-full bg-gray-50 rounded-xl p-3 cartoon-input min-h-[120px] resize-y" 
                        rows={5}
                    />
                </div>
                
                <div className="pt-4 border-t-2 border-gray-200">
                    <button 
                        onClick={handleGenerate} 
                        disabled={isLoading || !prompt.trim() || !imageFile} 
                        className="w-full flex items-center justify-center bg-blue-500 text-white font-bold py-3 px-4 rounded-xl cartoon-button"
                    >
                        {isLoading ? <><LoadingSpinner /> Analyzing...</> : 'Analyze Image'}
                    </button>
                </div>
            </div>

            {/* Right Panel: Output */}
            <div className="bg-white rounded-2xl p-6 cartoon-card flex flex-col h-full">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-bold text-gray-800">Analysis Result</h2>
                    {output && (
                        <button
                            id="walkthrough-copy-clear"
                            onClick={handleCopyAndClear}
                            className="flex items-center space-x-2 bg-amber-400 text-amber-900 font-bold py-2 px-3 rounded-xl cartoon-button"
                        >
                            <CopyIcon />
                            <span>Copy & Clear Data</span>
                        </button>
                    )}
                </div>
                <div className="p-4 bg-gray-100 rounded-xl flex-grow overflow-y-auto relative min-h-[200px]">
                    {isCleared && (
                        <div className="text-center text-green-600 flex flex-col items-center justify-center h-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="font-semibold mt-4">Data copied and session cleared.</p>
                            <p className="text-sm">Your privacy is important.</p>
                        </div>
                    )}
                    {!isCleared && isLoading && !output && (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <LoadingSpinner />
                            <p className="ml-2">Analyzing image...</p>
                        </div>
                    )}
                    {!isCleared && error && (
                        <div className="text-red-600 bg-red-100 p-4 rounded-xl">
                            <p className="font-bold">An error occurred:</p>
                            <p>{error}</p>
                        </div>
                    )}
                    {!isCleared && !isLoading && !error && !output && (
                        <div className="text-center text-gray-500 flex items-center justify-center h-full">
                            <p>Analysis will appear here.</p>
                        </div>
                    )}
                    {!isCleared && output && (
                         <div className="prose prose-sm prose-custom max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: marked.parse(output) as string }} />
                            {isLoading && <BlinkingCursor />}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageAnalyzer;