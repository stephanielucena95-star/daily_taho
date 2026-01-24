
import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { CategoryFilter } from './components/CategoryFilter';
import { NewsCard } from './components/NewsCard';
import { SkeletonCard } from './components/SkeletonCard';
import { ArticleDetail } from './components/ArticleDetail';
import { MOCK_ARTICLES, CATEGORIES } from './constants';
import { NewsCategory, Article } from './types';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useNewsFeed } from './hooks/useNewsFeed';

const SETTINGS_KEY = 'daily_taho_v15_settings';

function App() {
  const [activeCategory, setActiveCategory] = useState<NewsCategory>(NewsCategory.ALL);
  const [isDataSaver, setIsDataSaver] = useState<boolean>(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const { articles, loadingState, refreshNews, fetchError } = useNewsFeed(activeCategory);

  useEffect(() => {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      try {
        const { dataSaver } = JSON.parse(savedSettings);
        setIsDataSaver(!!dataSaver);
      } catch (e) { }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ dataSaver: isDataSaver }));
  }, [isDataSaver]);

  const displayArticles = useMemo(() => {
    if (loadingState === 'fetching_rss') return [];
    if (articles.length > 0) return articles;
    if (fetchError) return MOCK_ARTICLES;
    return [];
  }, [articles, loadingState, fetchError]);

  if (selectedArticle) {
    return <ArticleDetail article={selectedArticle} onBack={() => setSelectedArticle(null)} />;
  }

  const isLoadingRSS = loadingState === 'fetching_rss';
  const isSummarizing = loadingState === 'summarizing';

  return (
    <div className="min-h-screen bg-off-white font-sans text-gray-900 pb-12 antialiased transition-colors duration-500">
      <div className="fixed top-3 right-3 z-[100] flex items-center gap-2 bg-white/95 backdrop-blur-md px-2 py-1.5 rounded-full border border-gray-200 shadow-lg transition-all animate-in fade-in slide-in-from-top-2">
        <div className="relative flex h-2 w-2">
          {isSummarizing ? (
            <span className="animate-spin absolute inline-flex h-full w-full rounded-full border-2 border-blue-400 border-t-transparent"></span>
          ) : (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </>
          )}
        </div>
        <span className="text-[9px] font-black uppercase tracking-tighter text-gray-500">
          {isSummarizing ? 'Summarizing...' : 'Live Feed'}
        </span>
      </div>

      <Header isDataSaver={isDataSaver} onToggleDataSaver={setIsDataSaver} />
      <CategoryFilter categories={CATEGORIES} activeCategory={activeCategory} onSelectCategory={setActiveCategory} />

      <main className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => refreshNews(true)}
            disabled={isLoadingRSS || isSummarizing}
            className="group flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 border-gray-900 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 transition-transform ${isLoadingRSS || isSummarizing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
            {isLoadingRSS ? 'Ikinakarga...' : (isSummarizing ? 'Tinatapos...' : 'I-refresh')}
          </button>
          {isDataSaver && (
            <span className="text-[9px] font-black uppercase tracking-widest text-green-700 bg-green-50 px-2.5 py-1.5 rounded-lg border border-green-200 animate-pulse">
              Data Saver Active
            </span>
          )}
        </div>

        <div className="space-y-6">
          {isLoadingRSS ? (
            <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
          ) : (
            displayArticles.map((article, index) => (
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
          {!isLoadingRSS && displayArticles.length === 0 && (
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
