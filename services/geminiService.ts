import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export let geminiServiceAI: GoogleGenAI | undefined;

export const initializeGeminiService = (apiKey: string): boolean => {
    if (!apiKey) {
        geminiServiceAI = undefined;
        return false;
    }
    try {
        geminiServiceAI = new GoogleGenAI({ apiKey });
        return true;
    } catch (e) {
        console.error("Failed to initialize GoogleGenAI:", e);
        geminiServiceAI = undefined;
        return false;
    }
};

const generalErrorHandler = (error: unknown) => {
    console.error("Error calling AI API:", error);
    if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
            throw new Error("The provided AI API key is not valid. Please log out and try again with a valid key.");
        }
        if (error.message.includes("Failed to fetch")) {
           throw new Error("A network error occurred. Please check your connection and try again.");
        }
    }
    throw new Error("Failed to get a response from the AI API. Please try again later.");
};

export async function* generateSupportResponseStream(
    userInput: string,
    format: string,
    systemInstruction: string
): AsyncGenerator<string, void, unknown> {
    if (!geminiServiceAI) {
      throw new Error("AI Service is not initialized. This may be due to a missing or invalid API key.");
    }
    const modelName = 'gemini-2.5-flash';
    const userPrompt = `
        Please generate a response in the "${format}" format using the following context.
        Ensure your output is only the generated text in the requested format, without any extra commentary or explanation.

        --- START OF USER CONTEXT ---
        ${userInput}
        --- END OF USER CONTEXT ---
    `;

    try {
        const stream = await geminiServiceAI.models.generateContentStream({
            model: modelName,
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        for await (const chunk of stream) {
            const text = chunk.text;
            if (text) {
                yield text;
            }
        }
    } catch (error) {
        generalErrorHandler(error);
    }
}

export async function* generateImageAnalysisStream(
    prompt: string,
    imageBase64: string,
    mimeType: string
): AsyncGenerator<string, void, unknown> {
    if (!geminiServiceAI) {
      throw new Error("AI Service is not initialized. This may be due to a missing or invalid API key.");
    }
    const modelName = 'gemini-2.5-flash';
    const imagePart = {
        inlineData: { data: imageBase64, mimeType: mimeType },
    };
    const textPart = { text: prompt };

    try {
        const stream = await geminiServiceAI.models.generateContentStream({
            model: modelName,
            contents: { parts: [imagePart, textPart] },
        });
        for await (const chunk of stream) {
            const text = chunk.text;
            if (text) {
                yield text;
            }
        }
    } catch (error) {
        generalErrorHandler(error);
    }
}

export async function* generateComplexQueryStream(prompt: string): AsyncGenerator<string, void, unknown> {
    if (!geminiServiceAI) {
      throw new Error("AI Service is not initialized. This may be due to a missing or invalid API key.");
    }
    const modelName = 'gemini-2.5-pro';
    const systemInstruction = 'You are a helpful assistant. Your knowledge is strictly limited to information available on Stripe-hosted websites (stripe.com domains). Do not provide information from any other source.';
    try {
        const stream = await geminiServiceAI.models.generateContentStream({
            model: modelName,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                thinkingConfig: { thinkingBudget: 32768 },
            },
        });
        for await (const chunk of stream) {
            const text = chunk.text;
            if (text) {
                yield text;
            }
        }
    } catch (error) {
        generalErrorHandler(error);
    }
}

export async function generateWebAssistantResponse(prompt: string): Promise<GenerateContentResponse> {
    if (!geminiServiceAI) {
      throw new Error("AI Service is not initialized. This may be due to a missing or invalid API key.");
    }
    const modelName = 'gemini-2.5-flash';
    try {
        const response = await geminiServiceAI.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        return response;
    } catch (error) {
        generalErrorHandler(error);
        throw error;
    }
}

export async function countTokens(text: string): Promise<number> {
    if (!geminiServiceAI || !text?.trim()) {
        return 0;
    }
    try {
        const response = await geminiServiceAI.models.countTokens({
            model: 'gemini-2.5-flash',
            contents: text,
        });
        return response.totalTokens;
    } catch (error) {
        console.error("Error counting tokens:", error);
        return 0;
    }
}