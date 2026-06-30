import { WeatherData, CurrentWeather, ForecastItem, WeatherCondition } from '../types.ts';

// Deterministic hash to generate consistent weather per city if not explicitly defined
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const CITY_BASELINES: Record<string, { 
  nameKo: string; 
  country: string; 
  baseTemp: number; // in June (current month)
  humidity: number; 
  windSpeed: number;
  conditionWeight: ('Clear' | 'Clouds' | 'Rain' | 'Snow' | 'Thunderstorm' | 'Mist')[];
}> = {
  seoul: {
    nameKo: '서울',
    country: 'KR',
    baseTemp: 26,
    humidity: 75,
    windSpeed: 2.5,
    conditionWeight: ['Clouds', 'Clear', 'Rain', 'Clouds', 'Rain'],
  },
  서울: {
    nameKo: '서울',
    country: 'KR',
    baseTemp: 26,
    humidity: 75,
    windSpeed: 2.5,
    conditionWeight: ['Clouds', 'Clear', 'Rain', 'Clouds', 'Rain'],
  },
  busan: {
    nameKo: '부산',
    country: 'KR',
    baseTemp: 24,
    humidity: 80,
    windSpeed: 4.2,
    conditionWeight: ['Clear', 'Clouds', 'Clouds', 'Rain', 'Clear'],
  },
  부산: {
    nameKo: '부산',
    country: 'KR',
    baseTemp: 24,
    humidity: 80,
    windSpeed: 4.2,
    conditionWeight: ['Clear', 'Clouds', 'Clouds', 'Rain', 'Clear'],
  },
  jeju: {
    nameKo: '제주도',
    country: 'KR',
    baseTemp: 25,
    humidity: 82,
    windSpeed: 5.5,
    conditionWeight: ['Rain', 'Clouds', 'Clear', 'Rain', 'Clouds'],
  },
  제주: {
    nameKo: '제주도',
    country: 'KR',
    baseTemp: 25,
    humidity: 82,
    windSpeed: 5.5,
    conditionWeight: ['Rain', 'Clouds', 'Clear', 'Rain', 'Clouds'],
  },
  제주도: {
    nameKo: '제주도',
    country: 'KR',
    baseTemp: 25,
    humidity: 82,
    windSpeed: 5.5,
    conditionWeight: ['Rain', 'Clouds', 'Clear', 'Rain', 'Clouds'],
  },
  incheon: {
    nameKo: '인천',
    country: 'KR',
    baseTemp: 24,
    humidity: 78,
    windSpeed: 3.8,
    conditionWeight: ['Clouds', 'Clear', 'Mist', 'Clouds', 'Rain'],
  },
  인천: {
    nameKo: '인천',
    country: 'KR',
    baseTemp: 24,
    humidity: 78,
    windSpeed: 3.8,
    conditionWeight: ['Clouds', 'Clear', 'Mist', 'Clouds', 'Rain'],
  },
  daegu: {
    nameKo: '대구',
    country: 'KR',
    baseTemp: 29,
    humidity: 65,
    windSpeed: 1.8,
    conditionWeight: ['Clear', 'Clear', 'Clouds', 'Thunderstorm', 'Clear'],
  },
  대구: {
    nameKo: '대구',
    country: 'KR',
    baseTemp: 29,
    humidity: 65,
    windSpeed: 1.8,
    conditionWeight: ['Clear', 'Clear', 'Clouds', 'Thunderstorm', 'Clear'],
  },
  daejeon: {
    nameKo: '대전',
    country: 'KR',
    baseTemp: 26,
    humidity: 72,
    windSpeed: 2.1,
    conditionWeight: ['Clouds', 'Clear', 'Clouds', 'Rain', 'Clear'],
  },
  대전: {
    nameKo: '대전',
    country: 'KR',
    baseTemp: 26,
    humidity: 72,
    windSpeed: 2.1,
    conditionWeight: ['Clouds', 'Clear', 'Clouds', 'Rain', 'Clear'],
  },
  gwangju: {
    nameKo: '광주',
    country: 'KR',
    baseTemp: 27,
    humidity: 74,
    windSpeed: 2.0,
    conditionWeight: ['Clear', 'Clouds', 'Rain', 'Clear', 'Clouds'],
  },
  광주: {
    nameKo: '광주',
    country: 'KR',
    baseTemp: 27,
    humidity: 74,
    windSpeed: 2.0,
    conditionWeight: ['Clear', 'Clouds', 'Rain', 'Clear', 'Clouds'],
  },
  suwon: {
    nameKo: '수원',
    country: 'KR',
    baseTemp: 25.5,
    humidity: 74,
    windSpeed: 2.2,
    conditionWeight: ['Clouds', 'Clear', 'Clouds', 'Rain', 'Clear'],
  },
  수원: {
    nameKo: '수원',
    country: 'KR',
    baseTemp: 25.5,
    humidity: 74,
    windSpeed: 2.2,
    conditionWeight: ['Clouds', 'Clear', 'Clouds', 'Rain', 'Clear'],
  },
  ulsan: {
    nameKo: '울산',
    country: 'KR',
    baseTemp: 25,
    humidity: 76,
    windSpeed: 3.5,
    conditionWeight: ['Clear', 'Clouds', 'Clouds', 'Rain', 'Clear'],
  },
  울산: {
    nameKo: '울산',
    country: 'KR',
    baseTemp: 25,
    humidity: 76,
    windSpeed: 3.5,
    conditionWeight: ['Clear', 'Clouds', 'Clouds', 'Rain', 'Clear'],
  },
  tokyo: {
    nameKo: '도쿄',
    country: 'JP',
    baseTemp: 25,
    humidity: 70,
    windSpeed: 3.0,
    conditionWeight: ['Clouds', 'Rain', 'Clear', 'Clouds', 'Clouds'],
  },
  도쿄: {
    nameKo: '도쿄',
    country: 'JP',
    baseTemp: 25,
    humidity: 70,
    windSpeed: 3.0,
    conditionWeight: ['Clouds', 'Rain', 'Clear', 'Clouds', 'Clouds'],
  },
  newyork: {
    nameKo: '뉴욕',
    country: 'US',
    baseTemp: 24,
    humidity: 68,
    windSpeed: 4.0,
    conditionWeight: ['Clear', 'Clear', 'Clouds', 'Thunderstorm', 'Clouds'],
  },
  뉴욕: {
    nameKo: '뉴욕',
    country: 'US',
    baseTemp: 24,
    humidity: 68,
    windSpeed: 4.0,
    conditionWeight: ['Clear', 'Clear', 'Clouds', 'Thunderstorm', 'Clouds'],
  },
  london: {
    nameKo: '런던',
    country: 'GB',
    baseTemp: 18,
    humidity: 72,
    windSpeed: 4.5,
    conditionWeight: ['Clouds', 'Rain', 'Clouds', 'Mist', 'Clear'],
  },
  런던: {
    nameKo: '런던',
    country: 'GB',
    baseTemp: 18,
    humidity: 72,
    windSpeed: 4.5,
    conditionWeight: ['Clouds', 'Rain', 'Clouds', 'Mist', 'Clear'],
  },
  paris: {
    nameKo: '파리',
    country: 'FR',
    baseTemp: 21,
    humidity: 65,
    windSpeed: 3.5,
    conditionWeight: ['Clear', 'Clouds', 'Clouds', 'Rain', 'Clear'],
  },
  파리: {
    nameKo: '파리',
    country: 'FR',
    baseTemp: 21,
    humidity: 65,
    windSpeed: 3.5,
    conditionWeight: ['Clear', 'Clouds', 'Clouds', 'Rain', 'Clear'],
  },
  sydney: {
    nameKo: '시드니',
    country: 'AU',
    baseTemp: 14, // June is winter in Southern Hemisphere
    humidity: 60,
    windSpeed: 5.0,
    conditionWeight: ['Clear', 'Clear', 'Clouds', 'Rain', 'Clouds'],
  },
  시드니: {
    nameKo: '시드니',
    country: 'AU',
    baseTemp: 14,
    humidity: 60,
    windSpeed: 5.0,
    conditionWeight: ['Clear', 'Clear', 'Clouds', 'Rain', 'Clouds'],
  }
};

const WEATHER_DESCRIPTIONS: Record<string, { kr: string; icon: string }> = {
  Clear: { kr: '맑음', icon: '01d' },
  Clouds: { kr: '구름 많음', icon: '03d' },
  Rain: { kr: '비', icon: '10d' },
  Snow: { kr: '눈', icon: '13d' },
  Thunderstorm: { kr: '뇌우', icon: '11d' },
  Drizzle: { kr: '이슬비', icon: '09d' },
  Mist: { kr: '안개', icon: '50d' },
};

const CANONICAL_MAP: Record<string, string> = {
  '서울': 'seoul',
  'seoul': 'seoul',
  '부산': 'busan',
  'busan': 'busan',
  '제주': 'jeju',
  '제주도': 'jeju',
  'jeju': 'jeju',
  '인천': 'incheon',
  'incheon': 'incheon',
  '대구': 'daegu',
  'daegu': 'daegu',
  '대전': 'daejeon',
  'daejeon': 'daejeon',
  '광주': 'gwangju',
  'gwangju': 'gwangju',
  '수원': 'suwon',
  'suwon': 'suwon',
  '울산': 'ulsan',
  'ulsan': 'ulsan',
  '도쿄': 'tokyo',
  'tokyo': 'tokyo',
  '뉴욕': 'newyork',
  'newyork': 'newyork',
  '런던': 'london',
  'london': 'london',
  '파리': 'paris',
  'paris': 'paris',
  '시드니': 'sydney',
  'sydney': 'sydney',
};

export function generateMockWeather(cityName: string): WeatherData {
  const rawKey = cityName.toLowerCase().replace(/\s+/g, '');
  const normalizedKey = CANONICAL_MAP[rawKey] || rawKey;
  const hash = hashCode(normalizedKey);
  
  // Try to match key or fallback to dynamic baseline based on hash
  let baseline = CITY_BASELINES[normalizedKey];
  let displayName = cityName;
  
  if (!baseline) {
    // Dynamically generate baseline
    const countries = ['KR', 'US', 'JP', 'GB', 'FR', 'DE', 'CA', 'AU', 'CN'];
    const isKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(cityName);
    const country = isKorean ? 'KR' : countries[hash % countries.length];
    const baseTemp = 10 + (hash % 22); // 10 to 32 degrees Celsius
    const humidity = 40 + (hash % 50); // 40% to 90%
    const windSpeed = 1 + (hash % 10) * 0.8; // 1 to 9 m/s
    const conditions: ('Clear' | 'Clouds' | 'Rain' | 'Snow' | 'Thunderstorm' | 'Mist')[] = ['Clear', 'Clouds', 'Rain', 'Mist'];
    
    baseline = {
      nameKo: cityName,
      country,
      baseTemp,
      humidity,
      windSpeed,
      conditionWeight: [
        conditions[hash % conditions.length],
        conditions[(hash + 1) % conditions.length],
        'Clouds'
      ]
    };
  } else {
    displayName = baseline.nameKo;
  }

  // Current weather state based on conditions array
  const mainCondition = baseline.conditionWeight[hash % baseline.conditionWeight.length];
  const desc = WEATHER_DESCRIPTIONS[mainCondition];
  
  const currentCondition: WeatherCondition = {
    id: 800 + (hash % 5),
    main: mainCondition,
    description: desc.kr,
    icon: desc.icon
  };

  const nowSecs = Math.floor(Date.now() / 1000);

  const current: CurrentWeather = {
    city: displayName,
    country: baseline.country,
    temp: Math.round((baseline.baseTemp + (hash % 5) - 2) * 10) / 10,
    feelsLike: Math.round((baseline.baseTemp + (hash % 5) - 1.5) * 10) / 10,
    tempMin: Math.round((baseline.baseTemp - 4) * 10) / 10,
    tempMax: Math.round((baseline.baseTemp + 4) * 10) / 10,
    humidity: baseline.humidity,
    windSpeed: baseline.windSpeed,
    windDeg: hash % 360,
    pressure: 1008 + (hash % 15),
    sunrise: nowSecs - (6 * 3600) + (hash % 1800), // around 6 AM
    sunset: nowSecs + (7 * 3600) - (hash % 1800),  // around 7 PM
    condition: currentCondition,
    dt: nowSecs,
  };

  // Generate 5 day forecast with 3-hour intervals (let's simplify to daily or 3-hour intervals. We can do 8 items per day, but to save data size and keep it super readable, let's generate 40 points, or 8 points representing daily trends)
  const forecast: ForecastItem[] = [];
  const conditionsPool: ('Clear' | 'Clouds' | 'Rain' | 'Snow' | 'Thunderstorm' | 'Mist')[] = [
    'Clear', 'Clouds', 'Rain', 'Clear', 'Clouds', 'Thunderstorm', 'Mist'
  ];

  // Let's generate 5 days * 8 points (every 3 hours) = 40 items
  for (let i = 1; i <= 40; i++) {
    const dt = nowSecs + (i * 3 * 3600);
    const hour = new Date(dt * 1000).getHours();
    
    // Diurnal temperature cycle: colder at night, warmer in afternoon
    const isDay = hour >= 6 && hour < 18;
    const diurnalOffset = isDay ? Math.sin((hour - 12) / 12 * Math.PI) * 4 : Math.sin((hour - 24) / 12 * Math.PI) * 4;
    
    // Multi-day weather trend
    const dayIndex = Math.floor(i / 8);
    const trendOffset = Math.sin(dayIndex + (hash % 10)) * 2.5;

    const temp = Math.round((baseline.baseTemp + diurnalOffset + trendOffset) * 10) / 10;
    
    // Consistent condition for the day, but slight hourly changes
    const condIdx = (hash + dayIndex) % baseline.conditionWeight.length;
    let itemConditionMain = baseline.conditionWeight[condIdx];
    
    // Slight probability of rain or cloud change based on hour
    if (i % 5 === 0 && itemConditionMain === 'Clear') {
      itemConditionMain = 'Clouds';
    }

    const itemDesc = WEATHER_DESCRIPTIONS[itemConditionMain];
    const iconCode = isDay ? itemDesc.icon.replace('n', 'd') : itemDesc.icon.replace('d', 'n');

    const itemCondition: WeatherCondition = {
      id: 800 + ((hash + i) % 5),
      main: itemConditionMain,
      description: itemDesc.kr,
      icon: iconCode
    };

    forecast.push({
      dt,
      temp,
      feelsLike: Math.round((temp + (isDay ? 0.5 : -0.5)) * 10) / 10,
      humidity: Math.min(100, Math.max(30, baseline.humidity + Math.round(diurnalOffset * -3))),
      condition: itemCondition,
      windSpeed: Math.round((baseline.windSpeed + Math.sin(i) * 1.5) * 10) / 10,
      pop: itemConditionMain === 'Rain' ? 0.8 : itemConditionMain === 'Thunderstorm' ? 0.95 : itemConditionMain === 'Clouds' ? 0.2 : 0,
    });
  }

  return {
    isDemo: true,
    current,
    forecast,
  };
}
