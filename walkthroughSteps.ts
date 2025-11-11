interface WalkthroughStep {
    targetId?: string;
    title: string;
    content: string;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    requiredMode?: 'SUPPORT' | 'IMAGE' | 'COMPLEX' | 'WEB' | 'CHAT';
}

export const walkthroughSteps: WalkthroughStep[] = [
    {
        title: "Welcome to the App!",
        content: "Let's take a quick tour of the main features. You can exit this guide at any time by clicking the close button.",
        placement: 'bottom',
    },
    {
        targetId: 'walkthrough-mode-switcher',
        title: 'Mode Switcher',
        content: "This is the main navigation. Use these tabs to switch between the different tools available in the app.",
        placement: 'bottom',
        requiredMode: 'SUPPORT',
    },
    {
        targetId: 'walkthrough-context-input',
        title: '1. Provide Context',
        content: "In the 'Support Gen' tool, you start here. Paste the user's message, case notes, or any other relevant details.",
        placement: 'bottom',
        requiredMode: 'SUPPORT',
    },
    {
        targetId: 'walkthrough-format-selector',
        title: '2. Select Output Formats',
        content: "Choose one or more formats for the AI to generate. You can get an email, internal notes, and more, all from one input.",
        placement: 'top',
        requiredMode: 'SUPPORT',
    },
    {
        targetId: 'walkthrough-generate-button',
        title: '3. Generate Response',
        content: "Once you're ready, click here. The AI will generate a response for each format you selected.",
        placement: 'top',
        requiredMode: 'SUPPORT',
    },
    {
        targetId: 'walkthrough-output-panel',
        title: 'View the Output',
        content: "Your generated responses will appear here. You can copy the text or even regenerate the response if needed.",
        placement: 'left',
        requiredMode: 'SUPPORT',
    },
    {
        targetId: 'walkthrough-image-upload',
        title: 'Image Analyzer',
        content: "Now let's check out the Image Analyzer. Here, you can upload an image by clicking, dragging, or pasting from your clipboard.",
        placement: 'bottom',
        requiredMode: 'IMAGE',
    },
    {
        targetId: 'walkthrough-copy-clear',
        title: 'Privacy First',
        content: "For your privacy, this button copies the result and then completely clears the image, prompt, and output from the app.",
        placement: 'left',
        requiredMode: 'IMAGE',
    },
    {
        targetId: 'walkthrough-complex-query-input',
        title: 'Complex Query',
        content: "For tough tasks, like summarizing a long document, use this tool. It uses a more powerful model for deeper reasoning.",
        placement: 'bottom',
        requiredMode: 'COMPLEX',
    },
    {
        targetId: 'walkthrough-web-assistant-input',
        title: 'Web Assistant',
        content: "Need up-to-date info? Ask the Web Assistant. It uses Google Search to answer questions about recent events.",
        placement: 'bottom',
        requiredMode: 'WEB',
    },
    {
        targetId: 'walkthrough-chat-input',
        title: 'Chat Bot',
        content: "Finally, have a conversation with the Stripe Expert Chat Bot to quickly find information from Stripe's public docs.",
        placement: 'top',
        requiredMode: 'CHAT',
    },
    {
        targetId: 'walkthrough-help-button',
        title: 'You\'re All Set!',
        content: "That's the tour! If you ever need a refresher, just click this 'Help' button to start the guide again.",
        placement: 'left',
        requiredMode: 'CHAT',
    }
];
