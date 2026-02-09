
import React, { useState, useMemo, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Header } from './components/Header';
import { CategoryFilter } from './components/CategoryFilter';
import { NewsCard } from './components/NewsCard';
import { SkeletonCard } from './components/SkeletonCard';
import { ArticleDetail } from './components/ArticleDetail';
import { MOCK_ARTICLES, CATEGORIES } from './constants';
import { NewsCategory, Article } from './types';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useNewsFeed } from './hooks/useNewsFeed';
import { motion, AnimatePresence } from 'framer-motion';

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

  // Deep linking: Check URL for ?article=slug and auto-select
  useEffect(() => {
    if (displayArticles.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const articleSlug = params.get('article');
    if (articleSlug && !selectedArticle) {
      const match = displayArticles.find(a => a.slug === articleSlug || a.id === articleSlug);
      if (match) {
        setSelectedArticle(match);
      }
    }
  }, [displayArticles, selectedArticle]);

  // Update URL when article is selected/deselected
  const handleSelectArticle = (article: Article | null) => {
    setSelectedArticle(article);
    if (article && article.slug) {
      window.history.pushState({}, '', `?article=${article.slug}`);
    } else {
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  const isLoadingRSS = loadingState === 'fetching_rss';
  const isSummarizing = loadingState === 'summarizing';

  return (
    <>
      <AnimatePresence mode="wait">
        {selectedArticle ? (
          <motion.div
            key="article"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.3, ease: 'circOut' }}
            className="w-full"
          >
            <ArticleDetail article={selectedArticle} onBack={() => handleSelectArticle(null)} />
          </motion.div>
        ) : (
          <motion.div
            key="feed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-[#f5f5f0] font-sans text-gray-900 pb-12 antialiased"
          >
            <div className="fixed top-3 right-3 z-[100] flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#d7ccc8] shadow-sm transition-all">
              <div className="relative flex h-2 w-2">
                {isSummarizing ? (
                  <span className="animate-spin absolute inline-flex h-full w-full rounded-full border-2 border-[#6d4c41] border-t-transparent"></span>
                ) : (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600"></span>
                  </>
                )}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#6d4c41]">
                {isSummarizing ? 'Finishing Up...' : 'Live Feed'}
              </span>
            </div>

            <Header isDataSaver={isDataSaver} onToggleDataSaver={setIsDataSaver} />
            <CategoryFilter categories={CATEGORIES} activeCategory={activeCategory} onSelectCategory={setActiveCategory} />

            <main className="max-w-md mx-auto px-4 py-6">
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={() => refreshNews(true)}
                  disabled={isLoadingRSS || isSummarizing}
                  className="group flex items-center gap-2 px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-widest border border-[#6d4c41] text-[#6d4c41] bg-white hover:bg-[#6d4c41] hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                >
                  <ArrowPathIcon className={`w-4 h-4 transition-transform ${isLoadingRSS || isSummarizing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                  {isLoadingRSS ? 'Fetching...' : (isSummarizing ? 'Thinking...' : 'Refresh')}
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
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <NewsCard
                        article={article}
                        isHero={index === 0}
                        index={index}
                        dataSaver={isDataSaver}
                        onSummaryClick={handleSelectArticle}
                      />
                    </motion.div>
                  ))
                )}
                {!isLoadingRSS && displayArticles.length === 0 && (
                  <div className="text-center py-20 border-2 border-dashed border-[#d7ccc8] rounded-3xl opacity-60 bg-white/50">
                    <p className="text-gray-400 font-black uppercase text-xs tracking-widest">Walang nakitang balita</p>
                    <p className="text-[10px] text-gray-400 mt-2 font-serif italic">Subukan muli sa ibang pagkakataon.</p>
                  </div>
                )}
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
      <Analytics />
    </>
  );
}

export default App;
