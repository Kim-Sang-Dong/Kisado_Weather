import { CurrentWeather } from '../types.ts';
import { Wind, Droplets, Gauge, Sunrise, Sunset, Compass } from 'lucide-react';

interface WeatherDetailsGridProps {
  weather: CurrentWeather;
}

export default function WeatherDetailsGrid({ weather }: WeatherDetailsGridProps) {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getWindDirection = (deg: number) => {
    const directions = ['북', '북동', '동', '남동', '남', '남서', '서', '북서'];
    const index = Math.round(((deg %= 360) < 0 ? deg + 360 : deg) / 45) % 8;
    return directions[index];
  };

  const details = [
    {
      id: 'humidity',
      title: '습도',
      value: `${weather.humidity}%`,
      desc: '공기 중의 수증기량',
      icon: Droplets,
      color: 'text-blue-500 bg-blue-100/40 dark:bg-blue-950/20',
    },
    {
      id: 'wind-speed',
      title: '풍속',
      value: `${weather.windSpeed} m/s`,
      desc: '바람의 속도',
      icon: Wind,
      color: 'text-sky-500 bg-sky-100/40 dark:bg-sky-950/20',
    },
    {
      id: 'wind-direction',
      title: '풍향',
      value: `${getWindDirection(weather.windDeg)}풍`,
      desc: `${weather.windDeg}° 방향`,
      icon: Compass,
      color: 'text-indigo-500 bg-indigo-100/40 dark:bg-indigo-950/20',
    },
    {
      id: 'pressure',
      title: '기압',
      value: `${weather.pressure} hPa`,
      desc: '해수면 기압 표준',
      icon: Gauge,
      color: 'text-emerald-500 bg-emerald-100/40 dark:bg-emerald-950/20',
    },
    {
      id: 'sunrise',
      title: '일출',
      value: formatTime(weather.sunrise),
      desc: '태양이 떠오르는 시간',
      icon: Sunrise,
      color: 'text-amber-500 bg-amber-100/40 dark:bg-amber-950/20',
    },
    {
      id: 'sunset',
      title: '일몰',
      value: formatTime(weather.sunset),
      desc: '태양이 지는 시간',
      icon: Sunset,
      color: 'text-orange-500 bg-orange-100/40 dark:bg-orange-950/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4" id="weather-details-grid">
      {details.map((detail) => {
        const Icon = detail.icon;
        return (
          <div
            id={`detail-${detail.id}`}
            key={detail.id}
            className="p-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-800/20 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {detail.title}
              </span>
              <div className={`p-1.5 rounded-lg ${detail.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-lg font-bold text-slate-800 dark:text-white">
                {detail.value}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                {detail.desc}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
