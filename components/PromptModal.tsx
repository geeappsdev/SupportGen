import React, { useState, useEffect } from 'react';

interface PromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPrompt: string;
    onSave: (newPrompt: string) => void;
    onReset: () => void;
}

const PromptModal: React.FC<PromptModalProps> = ({ isOpen, onClose, currentPrompt, onSave, onReset }) => {
    const [promptText, setPromptText] = useState(currentPrompt);

    useEffect(() => {
        setPromptText(currentPrompt);
    }, [currentPrompt, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(promptText);
    };

    const handleReset = () => {
        onReset();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-2xl cartoon-card w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b-2 border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">Customize System Prompt</h2>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full" aria-label="Close">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6 flex-grow overflow-y-auto">
                    <p className="text-sm text-gray-500 mb-4">You can modify the rules the AI uses to generate responses. Changes are saved locally in your browser.</p>
                    <textarea
                        value={promptText}
                        onChange={(e) => setPromptText(e.target.value)}
                        className="w-full h-full bg-gray-50 rounded-xl p-3 text-gray-800 placeholder-gray-500 transition duration-150 ease-in-out resize-y cartoon-input"
                        rows={18}
                    />
                </div>
                <div className="flex justify-between items-center p-4 border-t-2 border-gray-200">
                    <button onClick={handleReset} className="text-sm text-gray-500 hover:text-gray-800 font-medium py-2 px-4 rounded-xl transition duration-200">Reset to Default</button>
                    <div className="flex items-center space-x-3">
                        <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-xl cartoon-button">Cancel</button>
                        <button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-xl cartoon-button">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromptModal;
