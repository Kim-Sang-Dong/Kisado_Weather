import { motion } from 'motion/react';
import { CurrentWeather } from '../types.ts';
import { Star, CloudSun, Calendar, ArrowUp, ArrowDown } from 'lucide-react';

interface CurrentWeatherCardProps {
  weather: CurrentWeather;
  isCelsius: boolean;
  onToggleFavorite: (city: string) => void;
  isFavorite: boolean;
}

export default function CurrentWeatherCard({
  weather,
  isCelsius,
  onToggleFavorite,
  isFavorite,
}: CurrentWeatherCardProps) {
  const formatTemp = (celsius: number) => {
    if (isCelsius) return `${Math.round(celsius)}°C`;
    const fahrenheit = (celsius * 1.8) + 32;
    return `${Math.round(fahrenheit)}°F`;
  };

  const getConditionEmoji = (main: string) => {
    switch (main) {
      case 'Clear': return '☀️';
      case 'Clouds': return '☁️';
      case 'Rain': return '🌧️';
      case 'Drizzle': return '🌦️';
      case 'Thunderstorm': return '⛈️';
      case 'Snow': return '❄️';
      case 'Mist': return '🌫️';
      default: return '🌤️';
    }
  };

  const formattedDate = new Date(weather.dt * 1000).toLocaleDateString('ko-KR', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <motion.div
      id="current-weather-card"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/30 dark:border-slate-800/30 p-6 md:p-8 shadow-xl flex flex-col justify-between min-h-[320px]"
    >
      {/* Absolute Decorative Glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-sky-400/25 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top row: City Name, Date, Favorite trigger */}
      <div className="flex justify-between items-start z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white" id="weather-city-name">
              {weather.city}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300">
              {weather.country}
            </span>
            <button
              id="favorite-toggle-button"
              onClick={() => onToggleFavorite(weather.city)}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-amber-500 transition-colors"
              title={isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
            >
              <Star
                className={`w-5.5 h-5.5 transition-all ${
                  isFavorite ? 'fill-amber-400 text-amber-400 scale-110' : 'text-slate-400 hover:scale-105'
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formattedDate}
          </p>
        </div>
        
        {/* Massive Dynamic Emoji */}
        <div className="text-5xl md:text-6xl select-none filter drop-shadow-md">
          {getConditionEmoji(weather.condition.main)}
        </div>
      </div>

      {/* Temperature & Primary Info */}
      <div className="my-6 flex items-baseline gap-4 z-10">
        <span className="text-6xl md:text-7xl font-extrabold tracking-tighter text-slate-800 dark:text-white" id="weather-main-temp">
          {formatTemp(weather.temp)}
        </span>
        <div className="space-y-1">
          <span className="text-lg font-bold text-slate-700 dark:text-slate-200 block" id="weather-condition-desc">
            {weather.condition.description}
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
            체감 온도 {formatTemp(weather.feelsLike)}
          </span>
        </div>
      </div>

      {/* Temp High / Low row */}
      <div className="flex items-center gap-4 border-t border-slate-200/40 dark:border-slate-800/40 pt-4 mt-auto z-10">
        <div className="flex items-center gap-1.5">
          <div className="p-1 rounded-full bg-red-100/50 dark:bg-red-950/20 text-red-500 dark:text-red-400">
            <ArrowUp className="w-3.5 h-3.5" />
          </div>
          <div className="text-xs">
            <span className="text-slate-400 dark:text-slate-500 block">최고</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{formatTemp(weather.tempMax)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="p-1 rounded-full bg-blue-100/50 dark:bg-blue-950/20 text-blue-500 dark:text-blue-400">
            <ArrowDown className="w-3.5 h-3.5" />
          </div>
          <div className="text-xs">
            <span className="text-slate-400 dark:text-slate-500 block">최저</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{formatTemp(weather.tempMin)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
