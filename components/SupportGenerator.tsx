import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { generateSupportResponseStream } from '../services/geminiService';
import { AI_SYSTEM_PROMPT_RULES, RESPONSE_FORMATS } from '../constants';
import { LinkFeedback } from '../types';
import InputPanel from './InputPanel';
import OutputPanel from './OutputPanel';
import PromptModal from './PromptModal';

const SupportGenerator: React.FC = () => {
    const [output, setOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userInput, setUserInput] = useState('');
    const [selectedFormats, setSelectedFormats] = useState<string[]>([RESPONSE_FORMATS[0].id]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);

    const [systemPrompt, setSystemPrompt] = useState(() => {
        try { return localStorage.getItem('customSystemPrompt') || AI_SYSTEM_PROMPT_RULES; }
        catch (e) { console.error("Could not access localStorage:", e); return AI_SYSTEM_PROMPT_RULES; }
    });

    const [linkFeedback, setLinkFeedback] = useState<LinkFeedback>(() => {
        try { return JSON.parse(localStorage.getItem('linkFeedback') || '{}'); }
        catch (e) { console.error("Could not access localStorage for link feedback:", e); return {}; }
    });

    const blockedUrls = useMemo(() => Object.entries(linkFeedback).filter(([, feedback]) => feedback === 'bad').map(([url]) => url), [linkFeedback]);

    const handleGenerate = useCallback(async () => {
        setIsLoading(true); setError(null); setOutput('');
        if (!userInput.trim()) { setError("Please enter some context or an issue description."); setIsLoading(false); return; }
        if (selectedFormats.length === 0) { setError("Please select at least one output format."); setIsLoading(false); return; }

        try {
            const finalSystemPrompt = systemPrompt.replace('{blocked_links_list}', blockedUrls.length > 0 ? blockedUrls.join('\n') : 'No blocked links.');
            let isFirstStream = true;
            for (const format of selectedFormats) {
                if (!isFirstStream) setOutput(prev => prev + '\n\n---\n\n');
                isFirstStream = false;
                const stream = generateSupportResponseStream(userInput, format, finalSystemPrompt);
                for await (const chunk of stream) setOutput(prev => prev + chunk);
            }
        } catch (err) { setError(err instanceof Error ? err.message : "An unknown error occurred."); }
        finally { setIsLoading(false); }
    }, [userInput, selectedFormats, systemPrompt, blockedUrls]);
    
    const handleLinkFeedback = useCallback((url: string, feedback: 'good' | 'bad') => {
        setLinkFeedback(prevFeedback => {
            const newFeedback = { ...prevFeedback, [url]: feedback };
            try { localStorage.setItem('linkFeedback', JSON.stringify(newFeedback)); } catch (e) { console.error("Could not save link feedback to localStorage:", e); }
            if (feedback === 'bad') setIsRegenerating(true);
            return newFeedback;
        });
    }, []);

    const handleClearAll = () => { setUserInput(''); setSelectedFormats([RESPONSE_FORMATS[0].id]); setOutput(''); setError(null); };
    const isClearDisabled = !userInput.trim() && !output && !error;
    useEffect(() => { if (isRegenerating) { setIsRegenerating(false); handleGenerate(); } }, [isRegenerating, handleGenerate]);

    const handleSavePrompt = (newPrompt: string) => {
        setSystemPrompt(newPrompt);
        try { localStorage.setItem('customSystemPrompt', newPrompt); }
        catch (e) { console.error("Could not save to localStorage:", e); setError("Could not save prompt settings."); }
        setIsModalOpen(false);
    };
    const handleResetPrompt = () => {
        setSystemPrompt(AI_SYSTEM_PROMPT_RULES);
        try { localStorage.removeItem('customSystemPrompt'); } catch (e) { console.error("Could not remove from localStorage:", e); }
    };
    
    return (
        <>
            <div className="grid grid-cols-1 grid-rows-[auto_1fr] lg:grid-cols-2 lg:grid-rows-1 gap-8 h-full">
                <InputPanel 
                    userInput={userInput} 
                    setUserInput={setUserInput} 
                    selectedFormats={selectedFormats} 
                    setSelectedFormats={setSelectedFormats} 
                    onOpenSettings={() => setIsModalOpen(true)} 
                    onGenerate={handleGenerate} 
                    isLoading={isLoading} 
                    isClearDisabled={isClearDisabled} 
                    onClearAll={handleClearAll} 
                />
                <OutputPanel 
                    output={output} 
                    isLoading={isLoading} 
                    error={error} 
                    onRegenerate={handleGenerate} 
                    linkFeedback={linkFeedback} 
                    onLinkFeedback={handleLinkFeedback} 
                    showLinkFeedback={true} 
                />
            </div>
            <PromptModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                currentPrompt={systemPrompt} 
                onSave={handleSavePrompt} 
                onReset={handleResetPrompt} 
            />
        </>
    );
};

export default SupportGenerator;
