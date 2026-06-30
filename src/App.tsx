import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WeatherData } from './types.ts';
import { getWeatherBackgroundClass } from './utils/weatherUtils.ts';
import CitySearch from './components/CitySearch.tsx';
import CurrentWeatherCard from './components/CurrentWeatherCard.tsx';
import WeatherDetailsGrid from './components/WeatherDetailsGrid.tsx';
import ForecastSection from './components/ForecastSection.tsx';
import { Sun, CloudRain, ShieldCheck, Thermometer, Info, Moon, RefreshCw, AlertCircle } from 'lucide-react';

export default function App() {
  const [city, setCity] = useState<string>('Seoul');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCelsius, setIsCelsius] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('weather_favs');
    return saved ? JSON.parse(saved) : ['Seoul', 'Busan', 'Jeju'];
  });

  const fetchWeather = async (cityName: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/weather?q=${encodeURIComponent(cityName)}`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || '날씨 정보를 불러오는 데 실패했습니다.');
      }
      const data: WeatherData = await response.json();
      setWeather(data);
      // Synchronize city casing with what server returns
      setCity(data.current.city);
    } catch (err: any) {
      console.error(err);
      setError(err.message || '네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(city);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleSearch = (newCity: string) => {
    fetchWeather(newCity);
  };

  const handleToggleFavorite = (targetCity: string) => {
    let next: string[];
    const isFav = favorites.some((f) => f.toLowerCase() === targetCity.toLowerCase());
    if (isFav) {
      next = favorites.filter((f) => f.toLowerCase() !== targetCity.toLowerCase());
    } else {
      next = [...favorites, targetCity];
    }
    setFavorites(next);
    localStorage.setItem('weather_favs', JSON.stringify(next));
  };

  const toggleTemperatureUnit = () => {
    setIsCelsius(!isCelsius);
  };

  const handleRefresh = () => {
    fetchWeather(city);
  };

  // Get background gradient based on current weather condition
  const bgClass = weather 
    ? getWeatherBackgroundClass(weather.current.condition.main)
    : 'from-sky-400 via-blue-500 to-indigo-600 dark:from-slate-900 dark:to-slate-950 text-white';

  const isCurrentFavorite = weather 
    ? favorites.some((f) => f.toLowerCase() === weather.current.city.toLowerCase())
    : false;

  return (
    <div className={`min-h-screen transition-all duration-700 bg-gradient-to-br ${bgClass} ${isDarkMode ? 'dark' : ''}`}>
      {/* Container with Max Width for desktop refinement */}
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-10 space-y-6 md:space-y-8">
        
        {/* Header Section */}
        <header className="flex justify-between items-center bg-white/10 dark:bg-slate-900/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 dark:border-slate-800/10 shadow-sm" id="app-header">
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-sky-500 rounded-xl text-white shadow-md shadow-sky-500/20">
              <Sun className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-1.5">
                날씨 알리미
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-sky-500/15 text-sky-600 dark:text-sky-400 rounded">ON</span>
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                실시간 기상 캐스터 & 5일 예보
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2" id="header-controls">
            {/* Unit Toggle Button */}
            <button
              id="unit-toggle-button"
              onClick={toggleTemperatureUnit}
              className="px-3 py-1.5 rounded-xl bg-white/70 hover:bg-white dark:bg-slate-900/70 dark:hover:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
              title="섭씨/화씨 변경"
            >
              <Thermometer className="w-3.5 h-3.5 text-sky-500" />
              <span>{isCelsius ? '°F로 보기' : '°C로 보기'}</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              id="dark-mode-toggle"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl bg-white/70 hover:bg-white dark:bg-slate-900/70 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:scale-105 active:scale-95 transition-all"
              title={isDarkMode ? "라이트 모드" : "다크 모드"}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-sky-600" />}
            </button>
          </div>
        </header>

        {/* Info Banner for API Key & Demo Status */}
        {weather && (
          <div className={`rounded-2xl p-4 shadow-sm border ${
            weather.warning 
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-100' 
              : weather.isDemo 
                ? 'bg-amber-50 dark:bg-slate-900/60 border-amber-200/40 dark:border-amber-950/40 text-slate-800 dark:text-slate-200'
                : 'bg-emerald-500/10 border-emerald-500/20 text-slate-800 dark:text-slate-200'
          }`} id="api-info-banner">
            <div className="flex items-start gap-3">
              <div className={`p-1.5 rounded-lg mt-0.5 ${
                weather.warning 
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' 
                  : weather.isDemo 
                    ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
                    : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              }`}>
                <Info className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold">
                  {weather.warning 
                    ? '⚠️ API 설정 참고 사항' 
                    : weather.isDemo 
                      ? '⚠️ 시뮬레이션 모드 활성화 중' 
                      : '🔌 실시간 API 가동 중'}
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                  {weather.warning 
                    ? weather.warning 
                    : weather.isDemo 
                      ? '실시간 날씨 검색을 원하시면 프로젝트 루트의 .env 파일에 OPENWEATHER_API_KEY를 설정해주세요. 현재 가상의 날씨를 가공해 보여주는 시뮬레이션 상태입니다.'
                      : '설정해주신 OpenWeatherMap API 키로 실시간 글로벌 기상 관측 데이터를 받아오고 있습니다.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar & Suggestion Area */}
        <section className="space-y-4" id="search-section">
          <CitySearch
            onSearch={handleSearch}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            currentCity={city}
          />
        </section>

        {/* Main Content Area */}
        <main className="min-h-[400px] relative">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading-spinner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center py-20 space-y-4"
                id="loading-spinner-container"
              >
                <RefreshCw className="w-10 h-10 text-sky-500 animate-spin" />
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 animate-pulse">
                  글로벌 기상 관측소에서 동기화 중...
                </span>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error-display"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-red-50/50 dark:bg-red-950/10 border border-red-200/50 dark:border-red-900/30 rounded-3xl p-8 text-center max-w-md mx-auto space-y-4 shadow-lg backdrop-blur-md"
                id="error-display-card"
              >
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto shadow-inner">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-800 dark:text-red-300">날씨 검색 오류</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{error}</p>
                </div>
                <button
                  id="error-retry-button"
                  onClick={handleRefresh}
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-red-600/10"
                >
                  다시 시도
                </button>
              </motion.div>
            ) : weather ? (
              <motion.div
                key="weather-dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 md:space-y-8"
                id="weather-dashboard-container"
              >
                {/* Visual Grid: Current Card (left) & Details Grid (right) */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  <div className="lg:col-span-2">
                    <CurrentWeatherCard
                      weather={weather.current}
                      isCelsius={isCelsius}
                      onToggleFavorite={handleToggleFavorite}
                      isFavorite={isCurrentFavorite}
                    />
                  </div>
                  <div className="lg:col-span-3 flex flex-col justify-between">
                    <WeatherDetailsGrid weather={weather.current} />
                    
                    {/* Atmospheric Quick Tip */}
                    <div className="mt-4 p-4 rounded-2xl bg-white/20 dark:bg-slate-900/20 backdrop-blur-lg border border-white/10 dark:border-slate-800/10 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 shadow-sm">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span>현지 관측소 및 기상 위성 기반 예측 정보입니다.</span>
                      </div>
                      <button 
                        id="weather-refresh-button"
                        onClick={handleRefresh} 
                        className="p-1 rounded-lg hover:bg-white/20 dark:hover:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                        title="새로고침"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 5-day / Hourly forecasts */}
                <ForecastSection forecast={weather.forecast} isCelsius={isCelsius} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
