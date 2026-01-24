
import React from 'react';

interface HeaderProps {
  isDataSaver: boolean;
  onToggleDataSaver: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ isDataSaver, onToggleDataSaver }) => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b-2 border-gray-900 shadow-sm">
      <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex flex-col items-center -space-y-1">
          <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-gray-400 font-sans">Daily</span>
          <h1 className="font-serif font-black text-2xl tracking-tighter text-gray-900 italic transform -skew-x-6">
            TAHO
          </h1>
        </div>

        <div className="flex items-center gap-2">
           <div 
            onClick={() => onToggleDataSaver(!isDataSaver)}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-900 transition-colors">
              Data Saver
            </span>
            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isDataSaver ? 'bg-green-500' : 'bg-gray-200'}`}>
              <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform ${isDataSaver ? 'translate-x-4' : 'translate-x-0'}`}></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
