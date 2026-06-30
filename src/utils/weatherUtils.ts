import { ForecastItem } from '../types.ts';

export function getHourlyForecast(forecast: ForecastItem[]): ForecastItem[] {
  // Returns next 8 slots (24 hours)
  return forecast.slice(0, 8);
}

export interface DailyForecast {
  dayName: string;
  dateStr: string;
  tempMin: number;
  tempMax: number;
  humidity: number;
  condition: ForecastItem['condition'];
  pop: number;
  windSpeed: number;
}

export function getDailyForecast(forecast: ForecastItem[]): DailyForecast[] {
  const daysMap: Record<string, ForecastItem[]> = {};

  forecast.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const dateStr = date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' });
    if (!daysMap[dateStr]) {
      daysMap[dateStr] = [];
    }
    daysMap[dateStr].push(item);
  });

  const dailyForecasts: DailyForecast[] = [];

  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

  Object.keys(daysMap).forEach((dateStr, idx) => {
    // Skip today if it has very few data points, or keep it. Let's keep up to 5 days.
    const items = daysMap[dateStr];
    
    // Find min and max
    let tempMin = Infinity;
    let tempMax = -Infinity;
    let maxPop = 0;
    let avgHumidity = 0;
    let avgWind = 0;

    items.forEach((item) => {
      if (item.temp < tempMin) tempMin = item.temp;
      if (item.temp > tempMax) tempMax = item.temp;
      if (item.pop > maxPop) maxPop = item.pop;
      avgHumidity += item.humidity;
      avgWind += item.windSpeed;
    });

    avgHumidity = Math.round(avgHumidity / items.length);
    avgWind = Math.round((avgWind / items.length) * 10) / 10;

    // Use midday (noon or 12:00 / 15:00) condition as representative, fallback to first item
    const midItem = items.find((item) => {
      const hour = new Date(item.dt * 1000).getHours();
      return hour >= 11 && hour <= 15;
    }) || items[Math.floor(items.length / 2)];

    const date = new Date(midItem.dt * 1000);
    const dayOfWeek = daysOfWeek[date.getDay()];
    
    // Check if it is today
    const isToday = new Date().toDateString() === date.toDateString();
    const dayLabel = isToday ? '오늘' : `${dayOfWeek}요일`;

    dailyForecasts.push({
      dayName: dayLabel,
      dateStr,
      tempMin: Math.round(tempMin * 10) / 10,
      tempMax: Math.round(tempMax * 10) / 10,
      humidity: avgHumidity,
      condition: midItem.condition,
      pop: maxPop,
      windSpeed: avgWind,
    });
  });

  // Return max 5 days
  return dailyForecasts.slice(0, 5);
}

// Map OpenWeatherMap icon code to Lucide Icon or customized modern emojis/descriptions
export function getWeatherBackgroundClass(condition: string): string {
  switch (condition) {
    case 'Clear':
      return 'from-sky-400 via-amber-300 to-amber-100 dark:from-slate-900 dark:via-sky-950 dark:to-slate-950 text-sky-900 dark:text-sky-100';
    case 'Rain':
    case 'Drizzle':
      return 'from-slate-600 via-blue-800 to-indigo-900 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 text-blue-100';
    case 'Thunderstorm':
      return 'from-slate-800 via-purple-900 to-slate-950 dark:from-neutral-950 dark:via-purple-950 dark:to-black text-purple-100';
    case 'Snow':
      return 'from-teal-100 via-sky-200 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 text-sky-900 dark:text-sky-100';
    case 'Clouds':
      return 'from-slate-400 via-slate-500 to-blue-200 dark:from-slate-900 dark:via-neutral-800 dark:to-slate-950 text-slate-800 dark:text-slate-100';
    case 'Mist':
    default:
      return 'from-emerald-300 via-teal-400 to-slate-300 dark:from-zinc-900 dark:via-slate-800 dark:to-zinc-950 text-emerald-900 dark:text-emerald-100';
  }
}
