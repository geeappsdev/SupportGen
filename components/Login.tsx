import React, { useState } from 'react';
import { LoadingSpinner } from './icons/LoadingSpinner';

interface LoginProps {
    onLoginSuccess: (username: string, apiKey: string) => boolean;
}

const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const EyeSlashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
    </svg>
);

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!username.trim() || !apiKey.trim()) {
            return;
        }
        setIsLoading(true);
        const success = onLoginSuccess(username.trim(), apiKey.trim());
        if (!success) {
            setError("Invalid API Key. The key might be malformed or incorrect. Please check your key and try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen bg-amber-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">Support Response Generator</h1>
                <p className="text-gray-600 text-center mb-10">Enter your details to begin</p>
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 cartoon-card space-y-6">
                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded" role="alert">
                           <p className="text-sm">{error}</p>
                        </div>
                    )}
                    <div>
                        <label
                            htmlFor="username"
                            className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2"
                        >
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-gray-50 rounded-xl p-3 text-gray-800 placeholder-gray-400 cartoon-input"
                            required
                            autoFocus
                            autoComplete="username"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="apiKey"
                            className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2"
                        >
                            Gemini API Key
                        </label>
                        <div className="relative">
                            <input
                                id="apiKey"
                                type={showApiKey ? 'text' : 'password'}
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="w-full bg-gray-50 rounded-xl p-3 pr-10 text-gray-800 placeholder-gray-400 cartoon-input"
                                required
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowApiKey(!showApiKey)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                aria-label={showApiKey ? "Hide API key" : "Show API key"}
                            >
                                {showApiKey ? <EyeSlashIcon /> : <EyeIcon />}
                            </button>
                        </div>
                    </div>
                    
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={!username.trim() || !apiKey.trim() || isLoading}
                            className="w-full flex items-center justify-center bg-blue-500 text-white font-bold py-3 px-4 rounded-xl cartoon-button"
                        >
                            {isLoading ? <><LoadingSpinner /> Verifying...</> : 'Continue'}
                        </button>
                    </div>
                </form>

                <div className="mt-8 bg-amber-100/70 border-2 border-amber-300 rounded-2xl p-4 text-sm text-amber-900">
                    <p className="font-bold mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                        </svg>
                        API Key Required
                    </p>
                    <p>
                        This application requires a Google Gemini API key. You can get a free key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-blue-600">Google AI Studio</a>.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Login;