import React from 'react';

interface HeaderProps {
  isDataSaver: boolean;
  onToggleDataSaver: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ isDataSaver, onToggleDataSaver }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all duration-500 shadow-sm">
      <div className="max-w-md mx-auto px-6 py-4 flex flex-col items-center relative">
        <div className="flex flex-col items-center">
          <img
            src="/logo.png"
            alt="Daily Taho"
            className="h-10 w-auto object-contain"
          />
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
