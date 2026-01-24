
import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { CategoryFilter } from './components/CategoryFilter';
import { NewsCard } from './components/NewsCard';
import { SkeletonCard } from './components/SkeletonCard';
import { ArticleDetail } from './components/ArticleDetail';
import { MOCK_ARTICLES, CATEGORIES, RSS_FEEDS, PUBLISHER_HOME_PAGES } from './constants';
import { NewsCategory, Article } from './types';
import { GoogleGenAI } from "@google/genai";
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const STORAGE_KEY = 'daily_taho_v15_cache'; 
const SETTINGS_KEY = 'daily_taho_v15_settings';
const CACHE_DURATION = 15 * 60 * 1000; 

interface RawRSSItem {
  title: string;
  link: string;
  pubDate: string;
  sourceName: string;
}

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

const formatDisplayDate = (dateStr: string): string => {
  if (!dateStr) return 'Kasalukuyan';
  return dateStr.replace(/\s[+-]\d{4}$/, '').replace(/\sGMT[+-]\d+$/, '').trim();
};

function App() {
  const [activeCategory, setActiveCategory] = useState<NewsCategory>(NewsCategory.ALL);
  const [isLoading, setIsLoading] = useState<boolean>(true); 
  const [realArticles, setRealArticles] = useState<Article[]>([]);
  const [fetchError, setFetchError] = useState<boolean>(false);
  const [isDataSaver, setIsDataSaver] = useState<boolean>(false);
  const [newsCache, setNewsCache] = useState<Record<string, { data: Article[], timestamp: number }>>({});
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      try {
        const { dataSaver } = JSON.parse(savedSettings);
        setIsDataSaver(!!dataSaver);
      } catch (e) {}
    }
    try {
      const savedCache = localStorage.getItem(STORAGE_KEY);
      if (savedCache) setNewsCache(JSON.parse(savedCache));
    } catch (e) {}
  }, []);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ dataSaver: isDataSaver }));
  }, [isDataSaver]);

  const fetchNewsFromRSS = async (category: NewsCategory, force = false) => {
    const cached = newsCache[category];
    if (!force && cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
      setRealArticles(cached.data);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setFetchError(false);

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
              sourceName: name
            }));
          }
        } catch (e) { console.error(e); }
        return [];
      });

      const results = await Promise.all(fetchPromises);
      const aggregatedRaw = results.flat();

      const validated = aggregatedRaw
        .filter(item => isPathConsistent(item.title, item.link))
        .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

      if (validated.length === 0) throw new Error("No data");

      const apiKey = process.env.API_KEY;
      if (!apiKey) {
         console.warn("Missing API_KEY. Falling back to mock data.");
         setRealArticles(MOCK_ARTICLES);
         setIsLoading(false);
         return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Task: Summarize these Philippine news headlines. 
      Return ONLY a JSON array of objects with keys: title, source, summary_en, summary_tl, url, date. 
      summaries must be 3-5 sentences. bilingual English and Tagalog. 
      Data: ${JSON.stringify(validated.slice(0, 10))}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      const text = response.text || '';
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        const items = JSON.parse(jsonMatch[0]);
        const final: Article[] = items.map((item: any, idx: number) => ({
          id: `rss-${Date.now()}-${idx}`,
          title: item.title,
          source: { name: item.source },
          category: category,
          publishTime: formatDisplayDate(item.date || validated[idx]?.pubDate),
          readTime: '4 min read',
          imageUrl: '', 
          summaryEnglish: item.summary_en,
          summaryFilipino: item.summary_tl,
          url: item.url
        }));

        setRealArticles(final);
        const nextCache = { ...newsCache, [category]: { data: final, timestamp: Date.now() } };
        setNewsCache(nextCache);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextCache));
      }
    } catch (err) {
      console.error("Aggregation failed", err);
      setFetchError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsFromRSS(activeCategory, false);
  }, [activeCategory]);

  const articlesToDisplay = useMemo(() => {
    if (isLoading && realArticles.length === 0) return [];
    if (realArticles.length > 0) return realArticles;
    return fetchError ? MOCK_ARTICLES : [];
  }, [realArticles, isLoading, fetchError]);

  if (selectedArticle) {
    return <ArticleDetail article={selectedArticle} onBack={() => setSelectedArticle(null)} />;
  }

  return (
    <div className="min-h-screen bg-off-white font-sans text-gray-900 pb-12 antialiased transition-colors duration-500">
      <div className="fixed top-3 right-3 z-[100] flex items-center gap-2 bg-white/95 backdrop-blur-md px-2 py-1.5 rounded-full border border-gray-200 shadow-lg transition-all animate-in fade-in slide-in-from-top-2">
        <div className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </div>
        <span className="text-[9px] font-black uppercase tracking-tighter text-gray-500">Live Feed</span>
      </div>

      <Header isDataSaver={isDataSaver} onToggleDataSaver={setIsDataSaver} />
      <CategoryFilter categories={CATEGORIES} activeCategory={activeCategory} onSelectCategory={setActiveCategory} />
      
      <main className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
           <button 
              onClick={() => fetchNewsFromRSS(activeCategory, true)}
              disabled={isLoading}
              className="group flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 border-gray-900 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-4 h-4 transition-transform ${isLoading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
              {isLoading ? 'Ikinakarga...' : 'I-refresh'}
            </button>
            {isDataSaver && (
              <span className="text-[9px] font-black uppercase tracking-widest text-green-700 bg-green-50 px-2.5 py-1.5 rounded-lg border border-green-200 animate-pulse">
                Data Saver Active
              </span>
            )}
        </div>

        <div className="space-y-6">
          {isLoading && realArticles.length === 0 ? (
             <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
          ) : (
            articlesToDisplay.map((article, index) => (
              <NewsCard 
                key={article.id} 
                article={article} 
                isHero={index === 0} 
                index={index} 
                dataSaver={isDataSaver} 
                onSummaryClick={setSelectedArticle} 
              />
            ))
          )}
          {!isLoading && articlesToDisplay.length === 0 && (
             <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-3xl opacity-60">
               <p className="text-gray-400 font-black uppercase text-xs tracking-widest">Walang nakitang balita</p>
               <p className="text-[10px] text-gray-400 mt-2 font-serif italic">Subukan muli sa ibang pagkakataon.</p>
             </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
