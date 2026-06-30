import React, { useState } from 'react';
import { Search, Star, X, MapPin } from 'lucide-react';

interface CitySearchProps {
  onSearch: (city: string) => void;
  favorites: string[];
  onToggleFavorite: (city: string) => void;
  currentCity: string;
}

const POPULAR_CITIES = [
  { name: 'Seoul', label: '서울' },
  { name: 'Busan', label: '부산' },
  { name: 'Jeju', label: '제주도' },
  { name: 'Daegu', label: '대구' },
  { name: 'New York', label: '뉴욕' },
  { name: 'Tokyo', label: '도쿄' },
  { name: 'London', label: '런던' },
  { name: 'Paris', label: '파리' },
];

export default function CitySearch({ onSearch, favorites, onToggleFavorite, currentCity }: CitySearchProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setQuery('');
    }
  };

  const isCurrentFavorite = favorites.some(
    (fav) => fav.toLowerCase() === currentCity.toLowerCase()
  );

  return (
    <div className="w-full space-y-4" id="city-search-container">
      <form onSubmit={handleSubmit} className="relative w-full flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            id="city-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="도시 이름을 한글 또는 영문으로 입력하세요 (예: 서울, New York)"
            className="w-full pl-12 pr-12 py-3.5 bg-white/75 dark:bg-slate-900/75 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-800/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all shadow-sm"
          />
          {query && (
            <button
              id="clear-search-button"
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          id="search-submit-button"
          type="submit"
          className="px-6 py-3.5 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-2xl transition-all shadow-md shadow-sky-600/15 flex items-center justify-center gap-1 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Search className="w-4 h-4" />
          <span>검색</span>
        </button>
      </form>

      {/* Favorite & Quick Selection Rails */}
      <div className="space-y-3">
        {favorites.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1 mr-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              즐겨찾기:
            </span>
            {favorites.map((fav) => (
              <button
                id={`fav-city-${fav}`}
                key={fav}
                onClick={() => onSearch(fav)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1 border hover:scale-105 ${
                  currentCity.toLowerCase() === fav.toLowerCase()
                    ? 'bg-sky-500 text-white border-sky-400 shadow-sm shadow-sky-500/20'
                    : 'bg-white/50 hover:bg-white dark:bg-slate-900/50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200/50 dark:border-slate-800/50'
                }`}
              >
                <span>{fav}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1 mr-1">
            <MapPin className="w-3.5 h-3.5" />
            인기 도시:
          </span>
          {POPULAR_CITIES.map((city) => (
            <button
              id={`popular-city-${city.name}`}
              key={city.name}
              onClick={() => onSearch(city.name)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105 ${
                currentCity.toLowerCase() === city.name.toLowerCase() || 
                currentCity.toLowerCase() === city.label.toLowerCase()
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/20'
                  : 'bg-white/50 hover:bg-white dark:bg-slate-900/50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800/50'
              }`}
            >
              {city.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
