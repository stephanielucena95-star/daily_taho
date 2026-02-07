import { useState, useCallback, useEffect } from 'react';
import { Article } from '../types';
import { GoogleGenerativeAI } from "@google/generative-ai";

interface UseStreamingSummaryResult {
    englishSummary: string;
    filipinoSummary: string;
    isStreamingEnglish: boolean;
    isStreamingFilipino: boolean;
    error: string | null;
    startSummarizing: (article: Article) => Promise<void>;
}

export const useStreamingSummary = (): UseStreamingSummaryResult => {
    const [englishSummary, setEnglishSummary] = useState('');
    const [filipinoSummary, setFilipinoSummary] = useState('');
    const [isStreamingEnglish, setIsStreamingEnglish] = useState(false);
    const [isStreamingFilipino, setIsStreamingFilipino] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const startSummarizing = useCallback(async (article: Article) => {
        const apiKey = import.meta.env.VITE_API_KEY;
        if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
            setError("API Key missing.");
            return;
        }

        setEnglishSummary('');
        setFilipinoSummary('');
        setError(null);
        setIsStreamingEnglish(true);
        setIsStreamingFilipino(true);

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        try {
            // 1. English Summary Streaming
            const enPrompt = `Summarize this news article in 3 to 5 detailed English sentences. 
            Article Title: ${article.title}
            Article Content: ${article.summaryEnglish || article.title}
            
            STRICT RULES:
            - Exactly 3 to 5 sentences.
            - Raw text ONLY. No markdown, no bolding, no prefixes.
            - Focus on the factual core.`;

            const enResult = await model.generateContentStream(enPrompt);
            let fullEn = '';

            // Start the Filipino translation in parallel once we have context
            // actually, we can wait until the first chunk of EN arrives to trigger TL
            let tlStarted = false;

            for await (const chunk of enResult.stream) {
                const chunkText = chunk.text();
                fullEn += chunkText;
                setEnglishSummary(fullEn);

                if (!tlStarted && fullEn.length > 50) {
                    tlStarted = true;
                    // Trigger Filipino translation in background
                    // We'll use the ongoing fullEn as context or just the title/content again
                }
            }
            setIsStreamingEnglish(false);

            // 2. Filipino Translation (Sequential background)
            setIsStreamingFilipino(true);
            const tlPrompt = `Translate this news summary into high-quality Filipino (Tagalog). 
            English Summary: ${fullEn}
            
            STRICT RULES:
            - Matches the 3 to 5 sentence count of the source.
            - Raw text ONLY. No markdown.
            - Use natural Filipino suitable for a premium news app.
            - Ensure UTF-8 character handling for special characters.`;

            const tlResult = await model.generateContentStream(tlPrompt);
            let fullTl = '';
            for await (const chunk of tlResult.stream) {
                const chunkText = chunk.text();
                fullTl += chunkText;
                setFilipinoSummary(fullTl);
            }
            setIsStreamingFilipino(false);

        } catch (err: any) {
            console.error("Streaming Error:", err);
            setError(err.message || "Failed to generate summary.");
            setIsStreamingEnglish(false);
            setIsStreamingFilipino(false);
        }
    }, []);

    return {
        englishSummary,
        filipinoSummary,
        isStreamingEnglish,
        isStreamingFilipino,
        error,
        startSummarizing
    };
};
