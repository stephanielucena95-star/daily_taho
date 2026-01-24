
import React, { useState } from 'react';
import { Article } from '../types';
import { ClockIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { CATEGORY_THEME } from '../constants';

interface NewsCardProps {
  article: Article;
  isHero?: boolean;
  index?: number;
  dataSaver?: boolean;
  onSummaryClick: (article: Article) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ article, isHero = false, index = 0, dataSaver = false, onSummaryClick }) => {
  const [imageError, setImageError] = useState(false);
  const theme = CATEGORY_THEME[article.category] || CATEGORY_THEME.Lahat;

  // Rule: Do not fetch images if Data Saver is ON
  const shouldShowImage = !dataSaver && !!article.imageUrl && article.imageUrl.trim() !== '' && !imageError;

  const handleCardClick = (e: React.MouseEvent) => {
    // Perfect Link Rule Debugging
    console.log(`[Perfect Link Rule] Navigating strictly to RSS <link>: ${article.url}`);
    if (!article.url || article.url === '#') {
      console.error(`[Data Error] Missing RSS link for: ${article.title}`);
    }
  };

  return (
    <a
      href={article.url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleCardClick}
      className="flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4 transition-all duration-300 hover:shadow-md active:scale-[0.99] cursor-pointer group no-underline text-inherit block"
    >
      {/* Image Section - Deferred or Disabled for Data Saver */}
      {shouldShowImage && (
        <div className={`${isHero ? 'h-56' : 'h-48'} w-full relative overflow-hidden bg-gray-50`}>
          <img
            src={article.imageUrl}
            alt={article.title}
            width="800"
            height={isHero ? "450" : "400"}
            loading={index < 5 ? 'eager' : 'lazy'}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
          <div className="absolute top-3 left-3">
            <span
              className="px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest shadow-sm"
              style={{ backgroundColor: theme.bg, color: theme.text }}
            >
              {article.category}
            </span>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className={`p-5 flex flex-col ${!shouldShowImage ? 'border-t-4' : ''}`} style={!shouldShowImage ? { borderTopColor: theme.bg } : {}}>

        <div className="flex items-center gap-2 mb-2">
          {!shouldShowImage && (
            <span
              className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest mr-1"
              style={{ backgroundColor: theme.bg, color: theme.text }}
            >
              {article.category}
            </span>
          )}
          <span className="font-bold text-[10px] text-gray-500 uppercase tracking-tight">{article.source.name}</span>
          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
          <span className="text-[10px] text-gray-400 uppercase tracking-widest">{article.publishTime}</span>
        </div>

        <h2 className={`font-serif font-black text-gray-900 leading-tight mb-3 transition-colors group-hover:text-gray-700 ${isHero ? 'text-2xl' : 'text-xl'}`}>
          {article.title}
        </h2>



        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center text-[10px] text-gray-400 font-bold gap-1">
            <ClockIcon className="w-3 h-3" />
            <span className="uppercase tracking-widest">{article.readTime}</span>
          </div>

          <div
            role="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSummaryClick(article);
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-700 hover:bg-gray-100 transition-colors"
          >
            read summary
            <ChevronRightIcon className="w-3 h-3" />
          </div>
        </div>
      </div>
    </a>
  );
};
