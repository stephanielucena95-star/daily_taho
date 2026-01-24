
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
  NewspaperIcon
} from '@heroicons/react/24/outline';
import { CATEGORY_THEME } from '../constants';

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
  const [imageError, setImageError] = useState(false);
  const theme = CATEGORY_THEME[article.category] || CATEGORY_THEME.Lahat;

  // Fallback search URL if the direct link fails
  const fallbackSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(article.title + " " + article.source.name)}`;

  const hasValidImage = !!article.imageUrl && article.imageUrl.trim() !== '' && !imageError;

  return (
    <div className="bg-off-white min-h-screen flex flex-col animate-fade-in-up">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm px-4 py-3 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center text-gray-700 hover:text-gray-900 transition-colors"
        >
          <ChevronLeftIcon className="w-6 h-6 mr-1" />
          <span className="text-sm font-bold uppercase tracking-wide">Bumalik</span>
        </button>

        {/* Language Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
          <button
            onClick={() => setLanguage('EN')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
              language === 'EN' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ENG
          </button>
          <button
            onClick={() => setLanguage('TL')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
              language === 'TL' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            FIL
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto w-full flex-grow flex flex-col">
        {/* Article Content */}
        <div className="bg-white flex-grow flex flex-col shadow-sm">
           {/* Hero Image or Category Placeholder */}
           {hasValidImage ? (
              <div className="w-full h-64 relative">
                <img 
                  src={article.imageUrl} 
                  alt={article.title}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
              </div>
            ) : (
              // Category Placeholder Header
              <div 
                className="w-full h-64 flex flex-col items-center justify-center relative overflow-hidden" 
                style={{ backgroundColor: theme.bg }}
              >
                 <div className="opacity-10 absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                 <CategoryHeroIcon 
                    category={article.category} 
                    className="w-24 h-24 text-white opacity-40 mb-2 relative z-10" 
                 />
                 <span className="text-white font-black opacity-60 text-xl uppercase tracking-[0.2em] relative z-10">
                   {article.category}
                 </span>
              </div>
            )}

          <div className="p-6 flex-grow flex flex-col">
            {/* Metadata */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-serif font-bold">
                  {article.source.name.substring(0, 1)}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">{article.source.name}</span>
                  <span className="text-xs text-gray-500">{article.publishTime}</span>
                </div>
              </div>
                <span className="text-[10px] font-bold uppercase px-2 py-1 bg-gray-100 rounded text-gray-600">
                  {article.category}
                </span>
            </div>

            {/* Headline */}
            <h1 className="font-serif font-black text-2xl sm:text-3xl leading-tight text-gray-900 mb-6">
              {article.title}
            </h1>

            {/* AI Summary Block */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 mb-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: theme.bg }}></div>
              <div className="flex items-center gap-2 mb-3 text-gray-500">
                <GlobeAltIcon className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">
                  AI Summary ({language === 'EN' ? 'English' : 'Filipino'})
                </span>
              </div>
              
              <p className="text-base sm:text-lg leading-relaxed text-gray-800 font-sans">
                {language === 'EN' 
                  ? article.summaryEnglish 
                  : (article.summaryFilipino || "Pasensya na, walang available na pagsasalin para sa balitang ito.")}
              </p>
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {article.tags.map((tag, idx) => (
                  <span 
                    key={idx} 
                    className="text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 text-gray-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Link Out / Footer */}
            <div className="mt-auto pt-8 border-t border-gray-100 flex flex-col items-center text-center space-y-4">
              <div className="w-full">
                <p className="text-sm text-gray-500 mb-2 font-medium">Basahin ang buong kwento</p>
                <a 
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-gray-900 text-white font-bold py-3 px-4 rounded-lg shadow-sm hover:bg-gray-800 transition-all active:scale-[0.98]"
                >
                  <span>Basahin sa {article.source.name}</span>
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                </a>
              </div>

              <div className="text-xs text-gray-400">
                <span>Hindi gumagana ang link? </span>
                <a 
                  href={fallbackSearchUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium inline-flex items-center gap-0.5"
                >
                  <MagnifyingGlassIcon className="w-3 h-3" />
                  I-search sa Google
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
