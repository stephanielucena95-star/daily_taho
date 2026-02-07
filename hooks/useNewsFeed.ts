import { useState, useCallback, useEffect } from 'react';
import { Article, NewsCategory } from '../types';
import { RSS_FEEDS, PUBLISHER_HOME_PAGES, MOCK_ARTICLES, WEIGHTED_KEYWORDS } from '../constants';


const STORAGE_KEY = 'daily_taho_v21_cache';
const CACHE_DURATION = 15 * 60 * 1000;

const verifyAndFixLink = (link: string, sourceName: string): string => {
    if (!link || typeof link !== 'string' || !link.trim().startsWith('http')) {
        return PUBLISHER_HOME_PAGES[sourceName] || 'https://www.google.com';
    }
    return link;
};

const extractImageUrl = (html: string): string => {
    if (!html) return '';

    let imageUrl = '';

    // 1. og:image fallback
    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
        html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    if (ogMatch && ogMatch[1]) imageUrl = ogMatch[1];

    // 2. facebook:image:src fallback
    if (!imageUrl) {
        const fbMatch = html.match(/<meta[^>]+name=["']facebook:image:src["'][^>]+content=["']([^"']+)["']/i) ||
            html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']facebook:image:src["']/i);
        if (fbMatch && fbMatch[1]) imageUrl = fbMatch[1];
    }

    // 3. First <img> tag inside <article> or .main-content (SIMULATED by searching the HTML)
    // We look for any img tag as a final fallback since we are working with raw RSS HTML
    if (!imageUrl) {
        const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (imgMatch && imgMatch[1]) imageUrl = imgMatch[1];
    }

    if (imageUrl) {
        // Automatic https: prefixing for protocol-relative URLs
        if (imageUrl.startsWith('//')) {
            imageUrl = `https:${imageUrl}`;
        }

        // Filter out known trackers/icons
        if (imageUrl.includes('feedburner') || imageUrl.includes('doubleclick')) {
            console.log(`❌ Discarded tracker image: ${imageUrl}`);
            return '';
        }

        console.log(`✅ Extracted Image URL: ${imageUrl}`);
        return imageUrl;
    }

    return '';
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

/**
 * Lead Engineer Note: Implementing Weighted Scoring System
 * Rules:
 * 1. Nagbabagang Balita (10), Pulitika (8), Teknolohiya (7), Showbiz (5)
 * 2. Default: Nagbabagang Balita
 * 3. Tie-breaker: Nagbabagang Balita
 * 4. Whole-word matching via Regex
 */
const getWeightedCategory = (item: any): NewsCategory => {
    const text = `${item.title} ${item.description || ''}`.toLowerCase();
    const scores: Record<string, number> = {};

    // Initialize scores for all potential categories
    Object.keys(WEIGHTED_KEYWORDS).forEach(cat => {
        scores[cat] = 0;
    });

    // Calculate scores
    Object.entries(WEIGHTED_KEYWORDS).forEach(([category, data]) => {
        data.keywords.forEach(keyword => {
            // Whole-word matching using word boundaries
            const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'i');
            if (regex.test(text)) {
                scores[category] += data.weight;
            }
        });
    });

    // Extract categories that actually had matches
    const candidates = Object.entries(scores).filter(([_, score]) => score > 0);

    // Rule: Default to Nagbabagang Balita if no matches
    if (candidates.length === 0) return NewsCategory.BREAKING;

    // Rule: Sort by score (descending), apply Nagbabagang Balita tie-breaker
    candidates.sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1];
        // If scores are equal, Breaking News (Nagbabagang Balita) always wins
        if (a[0] === NewsCategory.BREAKING) return -1;
        if (b[0] === NewsCategory.BREAKING) return 1;
        return 0;
    });

    return candidates[0][0] as NewsCategory;
};

const matchesCategory = (item: any, category: NewsCategory): boolean => {
    if (category === NewsCategory.ALL) return true;

    // For individual category views, we check if the article's "Best Fit" matches
    const primary = getWeightedCategory(item);

    return primary === category;
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
                    // Added cache buster to bypass rss2json caching
                    const cacheBuster = `&_cb=${Date.now()}`;
                    const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}${cacheBuster}`);
                    const json = await res.json();
                    if (json.status === 'ok') {
                        return json.items.map((i: any) => ({
                            title: i.title,
                            link: verifyAndFixLink(i.link, name),
                            pubDate: i.pubDate,
                            sourceName: name,
                            // Content-First Layer: Use full 'content' first, fallback to description
                            description: i.content || i.description || '',
                            imageUrl: i.enclosure?.link || i.thumbnail || extractImageUrl(i.content || i.description || '')
                        }));
                    }
                } catch (e) {
                    console.error(`Fetch failed for ${name}:`, e);
                }
                return [];
            });

            const results = await Promise.all(fetchPromises);
            const aggregatedRaw = results.flat();

            const validated = aggregatedRaw
                .filter(item => isPathConsistent(item.title, item.link))
                .filter(item => matchesCategory(item, category))
                .filter(item => {
                    const textLength = (item.description || "").replace(/<[^>]*>?/gm, '').length;
                    return textLength > 20;
                })
                .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

            // Diversity-First Sorting: Group by source, take newest from each, then sort overall
            const groupedBySource: Record<string, Article[]> = {};
            validated.forEach(item => {
                const s = item.sourceName;
                if (!groupedBySource[s]) groupedBySource[s] = [];
                groupedBySource[s].push(item);
            });

            const diverseSelection: any[] = [];
            const sources = Object.keys(groupedBySource);
            let depth = 0;
            while (diverseSelection.length < 30 && depth < 10) {
                // To keep diversity but prioritize NEWNESS:
                // We pick the newest available from each source in rounds.
                // Since sources are already sorted internally (because 'validated' was sorted),
                // groupedBySource[s][depth] is the depth-th newest article from source s.
                sources.forEach(s => {
                    if (groupedBySource[s][depth]) {
                        diverseSelection.push(groupedBySource[s][depth]);
                    }
                });
                depth++;
            }

            // FINAL STEP: Sort the final selection by date again to ensure global recency
            // but we've already achieved a good mix. Actually, sorting the final selection
            // is better for the user who wants "What's Newest".
            diverseSelection.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());


            const topArticles = diverseSelection.slice(0, 10); // Still take top 10 for initial display

            // Initialize articles with raw data first so user sees SOMETHING
            const initialDisplayArticles: Article[] = topArticles.map((item, idx) => {
                const cleanText = item.description.replace(/<[^>]*>?/gm, '').trim();
                let initialShort = cleanText;
                const sentences = cleanText.match(/[^.!?]+[.!?]+/g);
                if (sentences && sentences.length >= 2) {
                    initialShort = sentences.slice(0, 2).join(' ');
                }
                return {
                    id: `rss-${Date.now()}-${idx}`,
                    title: item.title,
                    source: { name: item.sourceName },
                    category: getWeightedCategory(item),
                    publishTime: formatDisplayDate(item.pubDate),
                    readTime: '2 min read',
                    imageUrl: item.imageUrl || '',
                    summaryShort: initialShort,
                    summaryEnglish: cleanText, // Raw description as fallback
                    summaryFilipino: '',
                    url: item.link
                };
            });

            setArticles(initialDisplayArticles);

            // Initial cache
            const nextCache = { ...newsCache, [category]: { data: initialDisplayArticles, timestamp: Date.now() } };
            setNewsCache(nextCache);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(nextCache));

            setLoadingState('ready');

        } catch (err) {
            console.error("Critical Aggregation Error:", err);
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
