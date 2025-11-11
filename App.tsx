import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SupportGenerator from './components/SupportGenerator';
import ImageAnalyzer from './components/ImageAnalyzer';
import ComplexQuery from './components/ComplexQuery';
import WebAssistant from './components/WebAssistant';
import ChatBot from './components/ChatBot';
import { initializeGeminiService } from './services/geminiService';
import Login from './components/Login';
import Walkthrough from './components/Walkthrough';

const App: React.FC = () => {
    const [mode, setMode] = useState('SUPPORT');
    const [walkthroughStep, setWalkthroughStep] = useState<number>(-1); // -1 means closed, 0+ is the step index
    const [currentUser, setCurrentUser] = useState<string | null>(() => {
        try {
            const user = sessionStorage.getItem('currentUser');
            const key = sessionStorage.getItem('apiKey');
            if (user && key && initializeGeminiService(key)) {
                return user;
            }
            return null;
        } catch {
            return null;
        }
    });

    useEffect(() => {
        const DATA_EXPIRATION_KEY = 'lastDataClearTimestamp';
        const TWENTY_FOUR_HOURS_IN_MS = 24 * 60 * 60 * 1000;
        try {
            const lastClearTimestamp = localStorage.getItem(DATA_EXPIRATION_KEY);
            const now = Date.now();
            if (!lastClearTimestamp || (now - parseInt(lastClearTimestamp, 10) > TWENTY_FOUR_HOURS_IN_MS)) {
                localStorage.removeItem('customSystemPrompt');
                localStorage.removeItem('linkFeedback');
                localStorage.setItem(DATA_EXPIRATION_KEY, now.toString());
            }
        } catch (error) {
            console.error('Failed to process data expiration logic:', error);
        }
    }, []);

    const handleLoginSuccess = (username: string, apiKey: string): boolean => {
        if (initializeGeminiService(apiKey)) {
            try {
                sessionStorage.setItem('currentUser', username);
                sessionStorage.setItem('apiKey', apiKey);
            } catch (e) {
                console.error("Failed to set user/key in sessionStorage", e);
            }
            setCurrentUser(username);

            try {
                const hasSeenWalkthrough = localStorage.getItem('hasSeenWalkthrough');
                if (!hasSeenWalkthrough) {
                    setWalkthroughStep(0); // Start the walkthrough
                }
            } catch (e) {
                console.error("Could not access localStorage. Opening walkthrough by default.", e);
                setWalkthroughStep(0);
            }

            return true;
        }
        return false;
    };

    const handleLogout = () => {
        try {
            sessionStorage.removeItem('currentUser');
            sessionStorage.removeItem('apiKey');
        } catch (e) {
            console.error("Failed to remove user/key from sessionStorage", e);
        }
        setCurrentUser(null);
    };
    
    const handleCloseWalkthrough = () => {
        setWalkthroughStep(-1);
        try {
            localStorage.setItem('hasSeenWalkthrough', 'true');
        } catch (e) {
            console.error("Could not save walkthrough status to localStorage.", e);
        }
    };

    const handleStartWalkthrough = () => {
        setMode('SUPPORT'); // Ensure tour starts from a known state
        setWalkthroughStep(0);
    };

    const renderAppContent = () => {
        switch (mode) {
            case 'SUPPORT': return <SupportGenerator />;
            case 'IMAGE': return <ImageAnalyzer />;
            case 'COMPLEX': return <ComplexQuery />;
            case 'WEB': return <WebAssistant />;
            case 'CHAT': return <ChatBot />;
            default: return null;
        }
    };

    if (!currentUser) {
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <>
            <Walkthrough
                currentStep={walkthroughStep}
                setCurrentStep={setWalkthroughStep}
                onClose={handleCloseWalkthrough}
                currentMode={mode}
                onSetMode={setMode}
            />
            <div className="h-screen bg-amber-50 text-gray-800 flex flex-col">
                <Header 
                    activeMode={mode} 
                    onSetMode={setMode} 
                    user={currentUser} 
                    onLogout={handleLogout} 
                    onStartWalkthrough={handleStartWalkthrough}
                />
                <main className="p-4 md:p-8 flex-grow overflow-y-auto">
                    <div className="container mx-auto max-w-7xl h-full">
                        {renderAppContent()}
                    </div>
                </main>
            </div>
        </>
    );
};

export default App;