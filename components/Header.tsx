import React from 'react';

interface HeaderProps {
  isDataSaver: boolean;
  onToggleDataSaver: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ isDataSaver, onToggleDataSaver }) => {
  return (
    <header className="bg-white border-b border-gray-100 transition-all duration-500">
      <div className="max-w-md mx-auto px-6 py-6 flex flex-col items-center relative">
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-1">Daily</span>
          <h1 className="font-serif-display font-black text-4xl tracking-tight text-black italic">
            TAHO
          </h1>
        </div>

        <div className="absolute right-6 top-1/2 -translate-y-1/2">
          <button
            onClick={() => onToggleDataSaver(!isDataSaver)}
            className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${isDataSaver ? 'bg-black' : 'bg-gray-200'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${isDataSaver ? 'translate-x-4' : 'translate-x-0'}`}></div>
          </button>
        </div>
      </div>
    </header>
  );
};
