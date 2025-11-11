import React, { useState, useEffect, useCallback, useRef } from 'react';
import { marked } from 'marked';
import { Chat } from "@google/genai";
import { geminiServiceAI } from '../services/geminiService';
import { CHATBOT_SYSTEM_PROMPT } from '../constants';
import { ChatMessage } from '../types';
import { BotIcon } from './icons/BotIcon';
import { UserIcon } from './icons/UserIcon';
import { BlinkingCursor } from './BlinkingCursor';

const ChatBot: React.FC = () => {
    const getInitialHistory = (): ChatMessage[] => ([{ role: 'model', parts: [{ text: "Hello! I'm your Stripe expert assistant. How can I help you today with public Stripe documentation?" }] }]);
    const [history, setHistory] = useState<ChatMessage[]>(getInitialHistory());
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const initChat = useCallback(() => {
        if (geminiServiceAI) {
            chatRef.current = geminiServiceAI.chats.create({
                model: 'gemini-2.5-flash',
                config: { systemInstruction: CHATBOT_SYSTEM_PROMPT }
            });
            setError(null);
        } else {
            setError("ChatBot could not be initialized. Please try logging in again.");
        }
    }, []);

    useEffect(() => {
        initChat();
    }, [initChat]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [history, isLoading]);

    const handleSendMessage = async () => {
        if (!input.trim() || !chatRef.current) return;

        const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }] };
        setHistory(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);
        setError(null);
        const modelMessage: ChatMessage = { role: 'model', parts: [{ text: '' }] };
        setHistory(prev => [...prev, modelMessage]);

        try {
            const stream = await chatRef.current.sendMessageStream({ message: currentInput });
            for await (const chunk of stream) {
                if (chunk.text) {
                    setHistory(prev => {
                        const newHistory = [...prev];
                        const lastMessage = newHistory[newHistory.length - 1];
                        if (lastMessage?.role === 'model') lastMessage.parts[0].text += chunk.text;
                        return newHistory;
                    });
                }
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(errorMessage);
            setHistory(prev => {
                const newHistory = [...prev];
                const lastMessage = newHistory[newHistory.length - 1];
                if (lastMessage?.role === 'model') lastMessage.parts[0].text = `Error: ${errorMessage}`;
                return newHistory;
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearChat = () => {
        setHistory(getInitialHistory());
        setError(null);
        setInput('');
        initChat();
    };

    return (
        <div className="bg-white rounded-2xl cartoon-card flex flex-col h-full">
            <div className="flex justify-between items-center p-4 border-b-2 border-gray-200">
                <h2 className="text-lg font-bold text-gray-800">Stripe Expert Chat</h2>
                <button
                    onClick={handleClearChat}
                    className="text-sm text-gray-500 hover:text-red-500 font-medium py-1 px-3 rounded-lg hover:bg-red-100 transition-colors"
                    aria-label="Clear chat history"
                >
                    Clear Chat
                </button>
            </div>
            <div className="flex-grow p-4 overflow-y-auto space-y-6">
                {history.map((msg, index) => (
                    <div key={`${msg.role}-${index}`} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'model' && <BotIcon />}
                        <div className={`rounded-2xl p-3 max-w-xl ${msg.role === 'model' ? 'bg-gray-200 text-gray-800' : 'bg-blue-500 text-white'}`}>
                            <div className={`prose prose-sm max-w-none ${msg.role === 'model' ? 'prose-custom' : 'prose-invert'}`} dangerouslySetInnerHTML={{ __html: marked.parse(msg.parts[0].text) as string }} />
                            {isLoading && index === history.length - 1 && msg.role === 'model' && <BlinkingCursor />}
                        </div>
                        {msg.role === 'user' && <UserIcon />}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div id="walkthrough-chat-input" className="p-4 border-t-2 border-gray-200 bg-gray-50">
                {error && <div className="text-red-600 text-sm mb-2">{`Error: ${error}`}</div>}
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !isLoading) { e.preventDefault(); handleSendMessage(); } }}
                        placeholder="Type your message..."
                        className="w-full bg-white rounded-xl p-3 text-gray-800 placeholder-gray-400 cartoon-input"
                        disabled={isLoading}
                    />
                    <button onClick={handleSendMessage} disabled={isLoading || !input.trim()} className="bg-blue-500 text-white font-bold py-3 px-5 rounded-xl cartoon-button">
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatBot;