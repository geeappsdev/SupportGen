import React, { useState, useEffect, useLayoutEffect } from 'react';
import { walkthroughSteps } from '../walkthroughSteps';

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface WalkthroughProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  onClose: () => void;
  currentMode: string;
  onSetMode: (mode: string) => void;
}

const Walkthrough: React.FC<WalkthroughProps> = ({ currentStep, setCurrentStep, onClose, currentMode, onSetMode }) => {
    const [targetRect, setTargetRect] = useState<Rect | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<{ top: number, left: number }>({ top: 0, left: 0 });

    const isLastStep = currentStep === walkthroughSteps.length - 1;
    const step = currentStep >= 0 ? walkthroughSteps[currentStep] : null;

    const calculatePositions = (element: HTMLElement) => {
        const rect = element.getBoundingClientRect();
        const docScroll = { top: window.scrollY, left: window.scrollX };

        const highlightRect = {
            top: rect.top + docScroll.top,
            left: rect.left + docScroll.left,
            width: rect.width,
            height: rect.height,
        };
        setTargetRect(highlightRect);
        
        const placement = step?.placement || 'bottom';
        const tooltipPos = { top: 0, left: 0 };
        const gap = 16;
        
        switch (placement) {
            case 'top':
                tooltipPos.top = highlightRect.top - gap;
                tooltipPos.left = highlightRect.left + highlightRect.width / 2;
                break;
            case 'bottom':
                tooltipPos.top = highlightRect.top + highlightRect.height + gap;
                tooltipPos.left = highlightRect.left + highlightRect.width / 2;
                break;
            case 'left':
                tooltipPos.top = highlightRect.top + highlightRect.height / 2;
                tooltipPos.left = highlightRect.left - gap;
                break;
            case 'right':
                tooltipPos.top = highlightRect.top + highlightRect.height / 2;
                tooltipPos.left = highlightRect.left + highlightRect.width + gap;
                break;
        }
        setTooltipPosition(tooltipPos);
    };
    
    // Using useLayoutEffect to prevent flicker when positions are calculated
    useLayoutEffect(() => {
        if (currentStep < 0 || !step) {
            setTargetRect(null);
            return;
        }

        const updatePosition = () => {
            if (!step.targetId) {
                setTargetRect({ top: window.innerHeight / 2 + window.scrollY, left: window.innerWidth / 2 + window.scrollX, width: 0, height: 0 });
                setTooltipPosition({ top: window.innerHeight / 2 + window.scrollY, left: window.innerWidth / 2 + window.scrollX });
                return;
            }

            const element = document.getElementById(step.targetId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                // Use a short timeout to wait for scrolling to finish
                setTimeout(() => calculatePositions(element), 300);
            }
        };

        if (step.requiredMode && step.requiredMode !== currentMode) {
            onSetMode(step.requiredMode);
            // Wait for the new component to mount and be available in the DOM
            const timeoutId = setTimeout(updatePosition, 150);
            return () => clearTimeout(timeoutId);
        } else {
            updatePosition();
        }

        window.addEventListener('resize', updatePosition);
        return () => window.removeEventListener('resize', updatePosition);

    }, [currentStep, currentMode, onSetMode]);


    const handleNext = () => {
        if (!isLastStep) {
            setCurrentStep(currentStep + 1);
        } else {
            onClose();
        }
    };
    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };
    
    if (currentStep < 0 || !step) return null;

    const getTooltipTransform = () => {
        switch(step.placement) {
            case 'top': return 'translate(-50%, -100%)';
            case 'bottom': return 'translateX(-50%)';
            case 'left': return 'translate(-100%, -50%)';
            case 'right': return 'translateY(-50%)';
            default: return 'translate(-50%, -50%)'; // Center for no-target steps
        }
    };

    return (
        <div className="walkthrough-overlay">
            {targetRect && <div className="walkthrough-spotlight" style={{
                top: `${targetRect.top - 8}px`,
                left: `${targetRect.left - 8}px`,
                width: `${targetRect.width + 16}px`,
                height: `${targetRect.height + 16}px`,
            }}></div>}
            
            <div className="walkthrough-tooltip" style={{
                top: `${tooltipPosition.top}px`,
                left: `${tooltipPosition.left}px`,
                transform: getTooltipTransform(),
            }}>
                <div className="bg-white rounded-xl p-6 cartoon-card text-gray-800">
                    <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.content}</p>
                    <div className="flex justify-between items-center mt-6">
                        <span className="text-xs font-bold text-gray-500">{`${currentStep + 1} / ${walkthroughSteps.length}`}</span>
                        <div className="flex items-center gap-2">
                            {currentStep > 0 && <button onClick={handleBack} className="text-sm font-bold text-gray-600 hover:text-gray-900 px-3 py-1">Back</button>}
                            <button onClick={handleNext} className="bg-blue-500 text-white font-bold py-2 px-4 rounded-xl cartoon-button text-sm">{isLastStep ? 'Finish' : 'Next'}</button>
                        </div>
                    </div>
                </div>
            </div>
             <button onClick={onClose} className="absolute top-4 right-4 p-2 text-white bg-black/30 rounded-full hover:bg-black/50" aria-label="Close walkthrough">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};

export default Walkthrough;