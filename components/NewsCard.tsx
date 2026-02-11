
import React, { useState } from 'react';
import { Article, NewsCategory } from '../types';
import { ClockIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { CATEGORY_THEME } from '../constants';
import { motion } from 'framer-motion';

interface NewsCardProps {
  article: Article;
  isHero?: boolean;
  index?: number;
  dataSaver?: boolean;
  onSummaryClick: (article: Article) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ article, isHero = false, index = 0, dataSaver = false, onSummaryClick }) => {
  const [imgError, setImgError] = useState(false);
  const theme = CATEGORY_THEME[article.category] || CATEGORY_THEME[NewsCategory.ALL];
  const shouldShowImage = !dataSaver && article.imageUrl && !imgError;

  // Generate deep link using slug
  const deepLink = article.slug ? `/?article=${article.slug}` : '#';

  return (
    <motion.a
      href={deepLink}
      onClick={(e) => {
        e.preventDefault();
        onSummaryClick(article);
      }}
      whileHover={{ y: -4 }}
      className="flex flex-col bg-white rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-[0_15px_45px_rgba(0,0,0,0.08)] active:scale-[0.99] cursor-pointer group no-underline text-inherit block relative"
    >
      {/* Top Accent Border */}
      <div className="h-1 w-full" style={{ backgroundColor: theme.bg }}></div>

      {shouldShowImage && (
        <div className="w-full h-[160px] overflow-hidden border-b border-gray-50 bg-gray-50/50">
          <img
            src={article.imageUrl}
            alt=""
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:opacity-90"
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
          />
        </div>
      )}

      <div className="p-7 flex flex-col flex-grow">
        {/* Category & Meta */}
        <div className="flex items-center gap-3 mb-4">
          <span
            className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-white"
            style={{ backgroundColor: theme.bg }}
          >
            {article.category}
          </span>
          <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <span>{article.source.name}</span>
            <span className="mx-2 opacity-50">•</span>
            <span>{article.publishTime}</span>
          </div>
        </div>

        {/* Headline */}
        <h2 className={`font-serif-display font-black text-black leading-[1.15] mb-4 group-hover:text-gray-700 transition-colors ${isHero ? 'text-[28px] sm:text-[34px]' : 'text-[24px]'}`}>
          {article.title}
        </h2>

        {/* Summary */}
        <p className="text-gray-500 leading-relaxed font-sans text-[15px] mb-8 line-clamp-3">
          {article.summaryShort || article.summaryEnglish}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-5 border-t border-gray-50 font-sans">
          <div className="flex items-center text-[10px] text-gray-400 font-bold gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg">
            <ClockIcon className="w-4 h-4" />
            <span className="uppercase tracking-widest">{article.readTime}</span>
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSummaryClick(article);
            }}
            className="group flex items-center gap-1.5 px-6 py-2 bg-black hover:bg-gray-800 rounded-full text-[10px] font-bold uppercase tracking-widest text-white transition-all shadow-md active:scale-95"
          >
            Read Summary
            <ChevronRightIcon className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>
    </motion.a>
  );
};
