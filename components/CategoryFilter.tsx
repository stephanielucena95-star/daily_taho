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
    <div className="bg-off-white sticky top-[61px] z-40 py-2 border-b border-gray-200/50 shadow-sm">
      <div className="max-w-md mx-auto overflow-x-auto no-scrollbar px-4 flex space-x-2 pb-1">
        {categories.map((cat) => {
          const isActive = cat === activeCategory;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gray-900 text-white shadow-md transform scale-105'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
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