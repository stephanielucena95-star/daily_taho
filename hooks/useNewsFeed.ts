import { useState, useCallback, useEffect } from 'react';
import { Article, NewsCategory } from '../types';
import { RSS_FEEDS, PUBLISHER_HOME_PAGES, MOCK_ARTICLES, CATEGORY_KEYWORDS } from '../constants';
import { GoogleGenerativeAI } from "@google/generative-ai";

const STORAGE_KEY = 'daily_taho_v17_cache';
const CACHE_DURATION = 15 * 60 * 1000;

const verifyAndFixLink = (link: string, sourceName: string): string => {
    if (!link || typeof link !== 'string' || !link.trim().startsWith('http')) {
        return PUBLISHER_HOME_PAGES[sourceName] || 'https://www.google.com';
    }
    return link;
};

const isPathConsistent = (title: string, link: string): boolean => {
    const lowerTitle = title.toLowerCase();
    const lowerLink = link.toLowerCase();
    const polEcoKeywords = ['pbbm', 'marcos', 'economy', 'inflation', 'digitalization', 'government', 'dof', 'neda', 'pulitika', 'ekonomiya', 'monetary'];
    const mismatchPaths = ['/weather/', '/sports/', '/lifestyle/', '/entertainment/', '/showbiz/', '/isports/', '/celebrity/'];
    const hasPolEco = polEcoKeywords.some(kw => lowerTitle.includes(kw));
    const hasMismatchPath = mismatchPaths.some(path => lowerLink.includes(path));
    if (hasPolEco && hasMismatchPath) return false;
    return true;
};

const matchesCategory = (item: any, category: NewsCategory): boolean => {
    if (category === NewsCategory.ALL || category === NewsCategory.BREAKING) return true;

    const keywords = CATEGORY_KEYWORDS[category] || [];
    if (keywords.length === 0) return true; // Fallback

    const text = `${item.title} ${item.description || ''}`.toLowerCase();
    return keywords.some(keyword => text.includes(keyword.toLowerCase()));
};

const formatDisplayDate = (dateStr: string): string => {
    if (!dateStr) return 'Kasalukuyan';
    return dateStr.replace(/\s[+-]\d{4}$/, '').replace(/\sGMT[+-]\d+$/, '').trim();
};

export type LoadingState = 'idle' | 'fetching_rss' | 'summarizing' | 'ready' | 'error';

interface UseNewsFeedResult {
    articles: Article[];
    loadingState: LoadingState;
    refreshNews: (force?: boolean) => Promise<void>;
    fetchError: boolean;
}

export const useNewsFeed = (category: NewsCategory): UseNewsFeedResult => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loadingState, setLoadingState] = useState<LoadingState>('idle');
    const [fetchError, setFetchError] = useState<boolean>(false);
    const [newsCache, setNewsCache] = useState<Record<string, { data: Article[], timestamp: number }>>({});

    // Load cache on mount
    useEffect(() => {
        try {
            const savedCache = localStorage.getItem(STORAGE_KEY);
            if (savedCache) setNewsCache(JSON.parse(savedCache));
        } catch (e) { }
    }, []);

    const refreshNews = useCallback(async (force = false) => {
        const cached = newsCache[category];
        if (!force && cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
            setArticles(cached.data);
            setLoadingState('ready');
            return;
        }

        setLoadingState('fetching_rss');
        setFetchError(false);
        if (force) setArticles([]);

        try {
            const fetchPromises = Object.entries(RSS_FEEDS).map(async ([name, url]) => {
                try {
                    const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`);
                    const json = await res.json();
                    if (json.status === 'ok') {
                        return json.items.map((i: any) => ({
                            title: i.title,
                            link: verifyAndFixLink(i.link, name),
                            pubDate: i.pubDate,
                            sourceName: name,
                            // Store raw description for progressive loading
                            description: i.description || ''
                        }));
                    }
                } catch (e) { console.error(e); }
                return [];
            });

            const results = await Promise.all(fetchPromises);
            const aggregatedRaw = results.flat();

            const validated = aggregatedRaw
                .filter(item => isPathConsistent(item.title, item.link))
                .filter(item => matchesCategory(item, category)) // CATEGORY FILTER APPLIED HERE
                .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

            if (validated.length === 0) {
                // If specific category yields zero, maybe just show filtered 'ALL' but that defeats the purpose.
                // For now, let it be empty or maybe don't throw error if just empty category.
                if (category === NewsCategory.ALL) throw new Error("No data");
            }

            // PROGRESSIVE LOADING STEP 1: Show Raw Articles (Immediate)
            const rawArticles: Article[] = validated.map((item, idx) => {
                // Clean up HTML from description if possible, or just use it.
                // Increased limit to 500chars to avoid cutting off English summaries prematurely
                const cleanSummary = item.description.replace(/<[^>]*>?/gm, '').substring(0, 500) + '...';

                return {
                    id: `rss-${Date.now()}-${idx}`,
                    title: item.title,
                    source: { name: item.sourceName },
                    category: category,
                    publishTime: formatDisplayDate(item.pubDate),
                    readTime: 'Reading...',
                    imageUrl: '',
                    summaryEnglish: cleanSummary,
                    summaryFilipino: 'Isinasalin...', // Indication it's waiting for AI
                    url: item.link
                };
            });

            setArticles(rawArticles);
            setLoadingState('summarizing');

            // AI Summarization
            const apiKey = import.meta.env.VITE_API_KEY || process.env.API_KEY;

            if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
                console.warn("Missing API_KEY. Falling back to mock data.");
                // We keep raw articles but stop loading
                setLoadingState('ready');
                return;
            }

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            // Helper to process a batch of articles
            const processBatch = async (itemsToProcess: any[], startIndex: number) => {
                if (itemsToProcess.length === 0) return [];

                const prompt = `Task: Summarize these Philippine news headlines. 
        Return ONLY a JSON array of objects with keys: title, source, summary_en, summary_tl, url, date. 
        Rules:
        1. "summary_en": English summary, MUST be 3-5 complete sentences. Do NOT truncate sentences.
        2. "summary_tl": Tagalog summary, MUST be 3-5 complete sentences. Do NOT truncate sentences.
        3. Ensure summaries capture the main point of the news.
        Data: ${JSON.stringify(itemsToProcess)}`;

                try {
                    const result = await model.generateContent(prompt);
                    const response = await result.response;
                    const text = response.text();
                    const jsonMatch = text.match(/\[[\s\S]*\]/);

                    if (jsonMatch) {
                        const items = JSON.parse(jsonMatch[0]);
                        return items.map((item: any, i: number) => ({
                            id: `rss-${Date.now()}-${startIndex + i}`,
                            title: item.title,
                            source: { name: item.source },
                            category: category,
                            publishTime: formatDisplayDate(item.date || itemsToProcess[i]?.pubDate),
                            readTime: '4 min read',
                            imageUrl: '',
                            summaryEnglish: item.summary_en,
                            summaryFilipino: item.summary_tl,
                            url: item.url
                        }));
                    }
                } catch (e) {
                    console.error("Batch processing failed", e);
                }
                return [];
            };

            // CHUNKING: Split into Priority (Top 3) and Background (Rest)
            // Limit total to 10 like before
            const LIMIT = 10;
            const prioritySlice = validated.slice(0, 3);
            const backgroundSlice = validated.slice(3, LIMIT);

            // 1. Process Priority Batch
            const priorityArticles = await processBatch(prioritySlice, 0);

            if (priorityArticles.length > 0) {
                // Merge priority results with raw background articles
                const mergedState = [
                    ...priorityArticles,
                    ...rawArticles.slice(3, LIMIT) // Show raw for the rest while they load
                ];
                // Only update if we are still fetching for the same category? 
                // Ideally we should track request ID but for now simple state set is fine.
                setArticles(mergedState);
            }

            // 2. Process Background Batch
            if (backgroundSlice.length > 0) {
                const backgroundArticles = await processBatch(backgroundSlice, 3);

                if (backgroundArticles.length > 0) {
                    // Final state with all AI summaries
                    const finalState = [...priorityArticles, ...backgroundArticles];
                    setArticles(finalState);

                    // Update Cache
                    const nextCache = { ...newsCache, [category]: { data: finalState, timestamp: Date.now() } };
                    setNewsCache(nextCache);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextCache));
                }
            } else if (priorityArticles.length > 0) {
                // Case where fewer than 3 articles existed
                const finalState = [...priorityArticles];
                const nextCache = { ...newsCache, [category]: { data: finalState, timestamp: Date.now() } };
                setNewsCache(nextCache);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(nextCache));
            }

            setLoadingState('ready');

        } catch (err) {
            console.error("Aggregation failed", err);
            setFetchError(true);
            setLoadingState('error');
        }
    }, [category, newsCache]);

    // Trigger effect when category changes
    useEffect(() => {
        refreshNews(false);
    }, [refreshNews]);

    return { articles, loadingState, refreshNews, fetchError };
};

