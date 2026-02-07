import React from 'react';
import { NewsCategory } from '../types';

interface CategoryFilterProps {
  categories: NewsCategory[];
  activeCategory: NewsCategory;
  onSelectCategory: (category: NewsCategory) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  activeCategory,
  onSelectCategory
}) => {
  return (
    <div className="bg-white/90 backdrop-blur-md sticky top-0 z-40 py-4 border-b border-gray-100 transition-all">
      <div className="max-w-md mx-auto overflow-x-auto no-scrollbar px-6 flex space-x-2">
        {categories.map((cat) => {
          const isActive = cat === activeCategory;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`whitespace-nowrap px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.05em] transition-all duration-200 border ${isActive
                ? 'bg-[#18181b] text-white border-[#18181b]'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
};