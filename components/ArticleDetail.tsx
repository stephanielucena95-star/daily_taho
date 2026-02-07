import React, { useState } from 'react';
import { Article, NewsCategory } from '../types';
import {
  ChevronLeftIcon,
  GlobeAltIcon,
  ArrowTopRightOnSquareIcon,
  MagnifyingGlassIcon,
  BuildingLibraryIcon,
  CurrencyDollarIcon,
  TrophyIcon,
  FilmIcon,
  CpuChipIcon,
  GlobeAsiaAustraliaIcon,
  NewspaperIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { CATEGORY_THEME } from '../constants';
import { useStreamingSummary } from '../hooks/useStreamingSummary';

interface ArticleDetailProps {
  article: Article;
  onBack: () => void;
}

const CategoryHeroIcon = ({ category, className }: { category: NewsCategory, className: string }) => {
  switch (category) {
    case NewsCategory.POLITICS:
      return <BuildingLibraryIcon className={className} />;
    case NewsCategory.ECONOMY:
      return <CurrencyDollarIcon className={className} />;
    case NewsCategory.SPORTS:
      return <TrophyIcon className={className} />;
    case NewsCategory.ENTERTAINMENT:
      return <FilmIcon className={className} />;
    case NewsCategory.TEKNOLOHIYA:
      return <CpuChipIcon className={className} />;
    case NewsCategory.GLOBAL:
      return <GlobeAsiaAustraliaIcon className={className} />;
    case NewsCategory.BREAKING:
    default:
      return <NewspaperIcon className={className} />;
  }
};

export const ArticleDetail: React.FC<ArticleDetailProps> = ({ article, onBack }) => {
  const [language, setLanguage] = useState<'EN' | 'TL'>('EN');
  const theme = CATEGORY_THEME[article.category] || CATEGORY_THEME[NewsCategory.ALL];

  const {
    englishSummary,
    filipinoSummary,
    isStreamingEnglish,
    isStreamingFilipino,
    startSummarizing
  } = useStreamingSummary();

  // Trigger summary on mount
  React.useEffect(() => {
    startSummarizing(article);
  }, [article, startSummarizing]);

  // Fallback search URL if the direct link fails
  const fallbackSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(article.title + " " + article.source.name)}`;

  return (
    <div className="bg-white min-h-screen flex flex-col antialiased">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-4 flex items-center justify-between shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center text-black hover:bg-gray-50 transition-all group px-3 py-1.5 rounded-full"
        >
          <ChevronLeftIcon className="w-5 h-5 mr-1.5 stroke-[3] transition-transform group-hover:-translate-x-1" />
          <span className="text-[11px] font-bold uppercase tracking-widest">Bumalik</span>
        </button>

        {/* Language Toggle */}
        <div className="flex bg-gray-50 rounded-full p-1 border border-gray-100">
          <button
            onClick={() => setLanguage('EN')}
            className={`px-5 py-2 text-[10px] font-bold rounded-full transition-all ${language === 'EN'
              ? 'bg-black text-white shadow-md'
              : 'text-gray-500 hover:text-black'
              }`}
          >
            ENGLISH
          </button>
          <button
            onClick={() => setLanguage('TL')}
            className={`px-5 py-2 text-[10px] font-bold rounded-full transition-all flex items-center gap-2 ${language === 'TL'
              ? 'bg-black text-white shadow-md'
              : 'text-gray-500 hover:text-black'
              }`}
          >
            FILIPINO
            {isStreamingFilipino && !filipinoSummary && (
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></div>
            )}
          </button>
        </div>

        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: article.title, url: article.url });
            } else {
              navigator.clipboard.writeText(article.url);
              alert("Link copied!");
            }
          }}
          className="p-2.5 text-gray-400 hover:text-black hover:bg-gray-50 rounded-full transition-all"
        >
          <ShareIcon className="w-5 h-5 stroke-[2]" />
        </button>
      </div>

      <div className="max-w-xl mx-auto w-full flex-grow flex flex-col bg-white">
        <div className="flex-grow flex flex-col pt-12 pb-20">
          <div className="px-10 pb-8 flex items-center justify-between">
            <span className="px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-white"
              style={{ backgroundColor: theme.bg }}>
              {article.category}
            </span>
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
              <div className={`w-1.5 h-1.5 rounded-full ${isStreamingEnglish || isStreamingFilipino ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></div>
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                {isStreamingEnglish || isStreamingFilipino ? 'AI Streaming...' : 'Refreshed'}
              </span>
            </div>
          </div>

          <div className="px-10 flex-grow flex flex-col">
            {/* Headline */}
            <h1 className="font-serif-display font-black text-[32px] sm:text-[44px] leading-[1.05] text-black mb-10 tracking-tight">
              {article.title}
            </h1>

            {/* Metadata */}
            <div className="flex items-center gap-4 mb-10 pb-10 border-b border-gray-50">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg shadow-sm" style={{ backgroundColor: theme.bg }}>
                {article.source.name.substring(0, 1)}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-black uppercase tracking-widest mb-1">{article.source.name}</span>
                <div className="flex items-center gap-2 text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                  <span>{article.publishTime}</span>
                  <span>•</span>
                  <span>{article.readTime}</span>
                </div>
              </div>
            </div>

            {/* AI Summary Block */}
            <div className="bg-gray-50/50 rounded-[24px] p-8 sm:p-10 border border-gray-100 mb-12 relative overflow-hidden">
              <div className="h-1 w-full absolute top-0 left-0" style={{ backgroundColor: theme.bg }}></div>

              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2.5 text-black">
                  <div className="p-1.5 bg-white rounded border border-gray-100 shadow-sm">
                    <GlobeAltIcon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                    {language === 'EN' ? 'AI Summary' : 'Buod ng AI'}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-[18px] sm:text-[21px] leading-[1.6] text-black font-sans">
                  {language === 'EN'
                    ? (englishSummary || article.summaryEnglish || "Summarizing...")
                    : (filipinoSummary || (isStreamingFilipino ? "Isinasalin..." : "Pasensya na, wala pang available na pagsasalin."))}
                </p>
                {language === 'TL' && isStreamingFilipino && !filipinoSummary && (
                  <div className="flex gap-1.5 mt-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-black/10 animate-bounce"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-black/10 animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-black/10 animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                )}
              </div>

              <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Verified Contextual Insight</span>
                <div className="text-[10px] font-bold text-black opacity-30 italic">
                  Daily Taho
                </div>
              </div>
            </div>

            {/* Link Out / Footer */}
            <div className="mt-auto flex flex-col items-center">
              <div className="w-full max-w-sm">
                <button
                  onClick={() => window.open(article.url, '_blank')}
                  className="flex items-center justify-center gap-4 w-full bg-black text-white font-bold py-5 px-8 rounded-full shadow-lg hover:bg-gray-800 transition-all active:scale-[0.98] group"
                >
                  <span className="text-[11px] uppercase tracking-widest">Full Story on {article.source.name}</span>
                  <ArrowTopRightOnSquareIcon className="w-4 h-4 stroke-[3] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>

              <div className="mt-8 text-[11px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-4">
                <a
                  href={fallbackSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-black flex items-center gap-1.5 transition-colors"
                >
                  <MagnifyingGlassIcon className="w-4 h-4 stroke-[3]" />
                  Verify on Google
                </a>
                <span className="opacity-20">|</span>
                <span className="cursor-pointer hover:text-black">Report Issue</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
