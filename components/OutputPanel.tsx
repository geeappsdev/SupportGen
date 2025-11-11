import React, { useState, useEffect, useMemo, useRef } from 'react';
import { marked } from 'marked';
import { LinkFeedback } from '../types';
import { CheckIcon } from './icons/CheckIcon';
import { CopyIcon } from './icons/CopyIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { LoadingSpinner } from './icons/LoadingSpinner';
import { OutputPlaceholder } from './OutputPlaceholder';
import { BlinkingCursor } from './BlinkingCursor';

interface OutputPanelProps {
    output: string;
    isLoading: boolean;
    error: string | null;
    onRegenerate: () => void;
    linkFeedback: LinkFeedback;
    onLinkFeedback: (url: string, feedback: 'good' | 'bad') => void;
    showLinkFeedback: boolean;
}

const OutputPanel: React.FC<OutputPanelProps> = ({ output, isLoading, error, onRegenerate, linkFeedback, onLinkFeedback, showLinkFeedback }) => {
    const [copied, setCopied] = useState(false);
    const outputContainerRef = useRef<HTMLDivElement>(null);

    const renderedOutput = useMemo(() => {
        if (!output) return '';
        const preprocessUrls = (text: string) => {
            const wwwRegex = /(?<![a-zA-Z0-9+-.]:\/\/)(?<!@)\bwww\.[^\s<>()]+/g;
            return text.replace(wwwRegex, 'https://$&');
        };
        const processedOutput = preprocessUrls(output);
        marked.setOptions({ breaks: true, gfm: true });
        return marked.parse(processedOutput) as string;
    }, [output]);

    useEffect(() => { if (copied) { const timer = setTimeout(() => setCopied(false), 2000); return () => clearTimeout(timer); } }, [copied]);

    useEffect(() => {
        if (!outputContainerRef.current) return;
        outputContainerRef.current.querySelectorAll('.link-controls-container').forEach(el => el.remove());
        if (!showLinkFeedback) return;

        // Fix: Query for all anchor tags. The result is a NodeListOf<HTMLAnchorElement> which is iterable
        // and provides correctly typed elements in the callback, resolving the type errors.
        const links = outputContainerRef.current.querySelectorAll('a');
        links.forEach(linkElement => {
            const currentFeedback = linkFeedback[linkElement.href];
            linkElement.title = linkElement.href;
            linkElement.classList.toggle('link-bad', currentFeedback === 'bad');
            
            const controlsContainer = document.createElement('span');
            controlsContainer.className = 'link-controls-container inline-flex items-center gap-1.5 ml-1.5 align-middle';
            linkElement.insertAdjacentElement('afterend', controlsContainer);

            const copyButton = document.createElement('button');
            copyButton.className = 'inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium text-gray-700 bg-gray-200/80 hover:bg-gray-300 rounded align-middle transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-500';
            copyButton.setAttribute('aria-label', `Copy link: ${linkElement.href}`);
            copyButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg><span>Copy</span>`;
            copyButton.onclick = (e) => {
                e.preventDefault();
                navigator.clipboard.writeText(linkElement.href);
                const originalContent = copyButton.innerHTML;
                copyButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg><span class="text-green-600">Copied!</span>`;
                copyButton.disabled = true;
                setTimeout(() => { copyButton.innerHTML = originalContent; copyButton.disabled = false; }, 2000);
            };
            controlsContainer.appendChild(copyButton);

            const feedbackContainer = document.createElement('span');
            feedbackContainer.className = 'inline-flex items-center rounded-md bg-gray-200/80';
            const thumbsUpButton = document.createElement('button');
            thumbsUpButton.setAttribute('aria-label', 'Mark link as good');
            thumbsUpButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333V17a1 1 0 001 1h6.364a1 1 0 00.942-.67l1.7-5.1a1 1 0 00-.354-1.165l-2.788-2.788a1 1 0 00-1.414 0l-1.42 1.42a1 1 0 000 1.414l1.42 1.42L11 14.586l-1.42-1.42a1 1 0 00-1.414 0l-1.42 1.42V10.333a1 1 0 00-1-1H6z" /></svg>`;
            const thumbsDownButton = document.createElement('button');
            thumbsDownButton.setAttribute('aria-label', 'Mark link as bad');
            thumbsDownButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667V3a1 1 0 00-1-1H6.636a1 1 0 00-.942.67l-1.7 5.1a1 1 0 00.354 1.165l2.788 2.788a1 1 0 001.414 0l1.42-1.42a1 1 0 000-1.414L8.58 9.42l1.42-1.42a1 1 0 000-1.414L8.58 5.17l1.42-1.42a1 1 0 001.414 0L12.586 5H13v5.667a1 1 0 001 1h1z" /></svg>`;
            
            const baseClass = 'p-1 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500';
            const goodSelectedClass = 'bg-green-500/30 text-green-600';
            const badSelectedClass = 'bg-red-500/30 text-red-600';
            const defaultClass = 'text-gray-500 hover:text-gray-800 hover:bg-gray-300';
            const disabledClass = 'text-gray-400 cursor-not-allowed';

            thumbsUpButton.className = `${baseClass} rounded-l-md ${currentFeedback === 'good' ? goodSelectedClass : (currentFeedback === 'bad' ? disabledClass : defaultClass)}`;
            thumbsDownButton.className = `${baseClass} rounded-r-md ${currentFeedback === 'bad' ? badSelectedClass : (currentFeedback === 'good' ? disabledClass : defaultClass)}`;
            
            thumbsUpButton.disabled = currentFeedback === 'bad';
            thumbsDownButton.disabled = currentFeedback === 'good';

            thumbsUpButton.onclick = (e) => { e.preventDefault(); onLinkFeedback(linkElement.href, 'good'); };
            thumbsDownButton.onclick = (e) => { e.preventDefault(); onLinkFeedback(linkElement.href, 'bad'); };
            
            feedbackContainer.appendChild(thumbsUpButton);
            feedbackContainer.appendChild(thumbsDownButton);
            controlsContainer.appendChild(feedbackContainer);
        });
    }, [renderedOutput, linkFeedback, onLinkFeedback, showLinkFeedback]);

    const handleCopy = () => { navigator.clipboard.writeText(output); setCopied(true); };

    return (
        <div id="walkthrough-output-panel" className="bg-white rounded-2xl cartoon-card flex flex-col h-full">
            <div className="flex justify-between items-center p-4 border-b-2 border-gray-200 flex-wrap gap-2">
                <h2 className="text-lg font-bold text-gray-800">Generated Output</h2>
                <div className="flex items-center space-x-2">
                    {(output || error) && !isLoading && (
                        <button
                            onClick={onRegenerate}
                            disabled={isLoading}
                            className="flex items-center space-x-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-3 rounded-md transition duration-200"
                            aria-label="Regenerate response"
                        >
                            <RefreshIcon />
                            <span>Regenerate</span>
                        </button>
                    )}
                    {output && (
                        <button
                            onClick={handleCopy}
                            className="flex items-center space-x-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-3 rounded-md transition duration-200"
                            aria-label="Copy output text"
                        >
                            {copied ? <CheckIcon /> : <CopyIcon />}
                            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                        </button>
                    )}
                </div>
            </div>
            <div className="p-6 flex-grow relative overflow-y-auto">
                {isLoading && !output && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
                        <LoadingSpinner />
                        <p className="mt-4 text-gray-500">The AI is thinking...</p>
                    </div>
                )}
                {error && (
                    <div className="text-red-600 bg-red-100 p-4 rounded-xl">
                        <p className="font-bold">An error occurred:</p>
                        <p>{error}</p>
                    </div>
                )}
                {!isLoading && !error && !output && <OutputPlaceholder />}
                {output && (
                    <div
                        ref={outputContainerRef}
                        className="prose prose-sm prose-custom max-w-none text-gray-800 leading-relaxed prose-strong:text-gray-900 prose-headings:text-gray-900"
                    >
                        <div dangerouslySetInnerHTML={{ __html: renderedOutput }} />
                        {isLoading && <BlinkingCursor />}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OutputPanel;