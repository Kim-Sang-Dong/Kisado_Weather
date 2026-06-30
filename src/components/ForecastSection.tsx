import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ForecastItem } from '../types.ts';
import { getHourlyForecast, getDailyForecast } from '../utils/weatherUtils.ts';
import { Clock, Calendar, Umbrella, Droplets, Wind } from 'lucide-react';

interface ForecastSectionProps {
  forecast: ForecastItem[];
  isCelsius: boolean;
}

export default function ForecastSection({ forecast, isCelsius }: ForecastSectionProps) {
  const [activeTab, setActiveTab] = useState<'hourly' | 'daily'>('hourly');

  const formatTemp = (celsius: number) => {
    if (isCelsius) return `${Math.round(celsius)}°`;
    const fahrenheit = (celsius * 1.8) + 32;
    return `${Math.round(fahrenheit)}°`;
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

  const hourlyList = getHourlyForecast(forecast);
  const dailyList = getDailyForecast(forecast);

  return (
    <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-800/20 rounded-3xl p-6 shadow-lg space-y-6" id="forecast-section">
      {/* Header and Tab Toggles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
          {activeTab === 'hourly' ? <Clock className="w-5 h-5 text-sky-500" /> : <Calendar className="w-5 h-5 text-sky-500" />}
          <span>{activeTab === 'hourly' ? '오늘의 시간별 예보' : '주간 5일 예보'}</span>
        </h3>

        <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl w-full sm:w-auto" id="forecast-tabs">
          <button
            id="forecast-tab-hourly"
            onClick={() => setActiveTab('hourly')}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'hourly'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            시간별 (24시간)
          </button>
          <button
            id="forecast-tab-daily"
            onClick={() => setActiveTab('daily')}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'daily'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            일별 (5일간)
          </button>
        </div>
      </div>

      {/* Render Lists with Animations */}
      <div className="relative min-h-[160px] overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'hourly' ? (
            <motion.div
              key="hourly-panel"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent snap-x"
              id="hourly-forecast-list"
            >
              {hourlyList.map((item, idx) => {
                const date = new Date(item.dt * 1000);
                const hourStr = date.toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  hour12: false,
                });
                const isNow = idx === 0;

                return (
                  <div
                    id={`hourly-item-${idx}`}
                    key={item.dt}
                    className={`flex flex-col items-center justify-between min-w-[76px] p-3 rounded-2xl border snap-start transition-all hover:scale-105 ${
                      isNow
                        ? 'bg-sky-500/10 border-sky-500/30 text-sky-900 dark:text-sky-100'
                        : 'bg-white/30 dark:bg-slate-900/30 border-white/10 dark:border-slate-800/10 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-[11px] font-bold">
                      {isNow ? '지금' : hourStr}
                    </span>
                    <span className="text-3xl my-2.5 filter drop-shadow">
                      {getConditionEmoji(item.condition.main)}
                    </span>
                    <span className="text-sm font-extrabold">
                      {formatTemp(item.temp)}
                    </span>
                    
                    {/* Rain probability or humidity fallback */}
                    {item.pop > 0 ? (
                      <span className="text-[10px] font-semibold text-blue-500 flex items-center gap-0.5 mt-2">
                        <Umbrella className="w-3 h-3" />
                        {Math.round(item.pop * 100)}%
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-0.5 mt-2">
                        <Droplets className="w-3 h-3" />
                        {item.humidity}%
                      </span>
                    )}
                  </div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="daily-panel"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
              id="daily-forecast-list"
            >
              {dailyList.map((day, idx) => (
                <div
                  id={`daily-item-${idx}`}
                  key={day.dateStr}
                  className="flex items-center justify-between p-3.5 bg-white/30 dark:bg-slate-900/30 hover:bg-white/50 dark:hover:bg-slate-900/50 rounded-2xl border border-white/10 dark:border-slate-800/10 transition-all hover:scale-[1.01]"
                >
                  {/* Day and Date */}
                  <div className="flex flex-col w-20">
                    <span className="text-sm font-bold text-slate-800 dark:text-white">
                      {day.dayName}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                      {day.dateStr}
                    </span>
                  </div>

                  {/* Icon & Description */}
                  <div className="flex items-center gap-3 w-28 sm:w-36">
                    <span className="text-2xl filter drop-shadow">
                      {getConditionEmoji(day.condition.main)}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {day.condition.description}
                    </span>
                  </div>

                  {/* Rain Probability / Metrics */}
                  <div className="flex items-center gap-4 text-xs">
                    {day.pop > 0 && (
                      <span className="text-blue-500 font-bold flex items-center gap-0.5" title="강수 확률">
                        <Umbrella className="w-3.5 h-3.5" />
                        {Math.round(day.pop * 100)}%
                      </span>
                    )}
                    <span className="text-slate-400 dark:text-slate-500 flex items-center gap-0.5" title="평균 습도">
                      <Droplets className="w-3.5 h-3.5" />
                      {day.humidity}%
                    </span>
                  </div>

                  {/* Low / High temp ranges */}
                  <div className="flex items-center justify-end gap-3 w-24">
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                      {formatTemp(day.tempMin)}
                    </span>
                    {/* Visual Temp Bar */}
                    <div className="hidden sm:block h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
                      <div 
                        className="absolute top-0 bottom-0 left-1/4 right-1/4 bg-sky-400 dark:bg-sky-500 rounded-full" 
                      />
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      {formatTemp(day.tempMax)}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
