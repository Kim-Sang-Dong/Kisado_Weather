import { GoogleGenAI } from "@google/genai";

// === TYPES ===
interface WeatherCondition {
  id: number;
  main: 'Clear' | 'Clouds' | 'Rain' | 'Snow' | 'Thunderstorm' | 'Drizzle' | 'Mist';
  description: string;
  icon: string;
}

interface CurrentWeather {
  city: string;
  country: string;
  temp: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  windSpeed: number;
  windDeg: number;
  pressure: number;
  sunrise: number; // timestamp
  sunset: number;  // timestamp
  condition: WeatherCondition;
  dt: number; // timestamp
}

interface ForecastItem {
  dt: number; // timestamp
  temp: number;
  feelsLike: number;
  humidity: number;
  condition: WeatherCondition;
  windSpeed: number;
  pop: number; // probability of precipitation (0 to 1)
}

interface WeatherData {
  isDemo: boolean;
  current: CurrentWeather;
  forecast: ForecastItem[];
  apiError?: boolean;
  warning?: string;
}

// === DETERMINISTIC MOCK GENERATOR ===
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
  baseTemp: number; 
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
    baseTemp: 14,
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

function generateMockWeather(cityName: string): WeatherData {
  const rawKey = cityName.toLowerCase().replace(/\s+/g, '');
  const normalizedKey = CANONICAL_MAP[rawKey] || rawKey;
  const hash = hashCode(normalizedKey);
  
  let baseline = CITY_BASELINES[normalizedKey];
  let displayName = cityName;
  
  if (!baseline) {
    const countries = ['KR', 'US', 'JP', 'GB', 'FR', 'DE', 'CA', 'AU', 'CN'];
    const isKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(cityName);
    const country = isKorean ? 'KR' : countries[hash % countries.length];
    const baseTemp = 10 + (hash % 22);
    const humidity = 40 + (hash % 50);
    const windSpeed = 1 + (hash % 10) * 0.8;
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
    sunrise: nowSecs - (6 * 3600) + (hash % 1800),
    sunset: nowSecs + (7 * 3600) - (hash % 1800),
    condition: currentCondition,
    dt: nowSecs,
  };

  const forecast: ForecastItem[] = [];

  for (let i = 1; i <= 40; i++) {
    const dt = nowSecs + (i * 3 * 3600);
    const hour = new Date(dt * 1000).getHours();
    
    const isDay = hour >= 6 && hour < 18;
    const diurnalOffset = isDay ? Math.sin((hour - 12) / 12 * Math.PI) * 4 : Math.sin((hour - 24) / 12 * Math.PI) * 4;
    
    const dayIndex = Math.floor(i / 8);
    const trendOffset = Math.sin(dayIndex + (hash % 10)) * 2.5;

    const temp = Math.round((baseline.baseTemp + diurnalOffset + trendOffset) * 10) / 10;
    
    const condIdx = (hash + dayIndex) % baseline.conditionWeight.length;
    let itemConditionMain = baseline.conditionWeight[condIdx];
    
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

// === KOREAN CITY MAPPING ===
const KOREAN_CITY_MAP: Record<string, string> = {
  '서울': 'Seoul,KR',
  'seoul': 'Seoul,KR',
  '부산': 'Busan,KR',
  'busan': 'Busan,KR',
  '인천': 'Incheon,KR',
  'incheon': 'Incheon,KR',
  '대구': 'Daegu,KR',
  'daegu': 'Daegu,KR',
  '대전': 'Daejeon,KR',
  'daejeon': 'Daejeon,KR',
  '광주': 'Gwangju,KR',
  'gwangju': 'Gwangju,KR',
  '울산': 'Ulsan,KR',
  'ulsan': 'Ulsan,KR',
  '수원': 'Suwon,KR',
  'suwon': 'Suwon,KR',
  '창원': 'Changwon,KR',
  'changwon': 'Changwon,KR',
  '성남': 'Seongnam,KR',
  'seongnam': 'Seongnam,KR',
  '고양': 'Goyang,KR',
  'goyang': 'Goyang,KR',
  '용인': 'Yongin,KR',
  'yongin': 'Yongin,KR',
  '청주': 'Cheongju,KR',
  'cheongju': 'Cheongju,KR',
  '안산': 'Ansan,KR',
  'ansan': 'Ansan,KR',
  '전주': 'Jeonju,KR',
  'jeonju': 'Jeonju,KR',
  '천안': 'Cheonan,KR',
  'cheonan': 'Cheonan,KR',
  '제주': 'Jeju,KR',
  'jeju': 'Jeju,KR',
  '제주도': 'Jeju,KR',
  '춘천': 'Chuncheon,KR',
  'chuncheon': 'Chuncheon,KR',
  '강릉': 'Gangneung,KR',
  'gangneung': 'Gangneung,KR',
  '포항': 'Pohang,KR',
  'pohang': 'Pohang,KR',
  '여수': 'Yeosu,KR',
  'yeosu': 'Yeosu,KR',
  '목포': 'Mokpo,KR',
  'mokpo': 'Mokpo,KR',
  '안양': 'Anyang,KR',
  'anyang': 'Anyang,KR',
  '의정부': 'Uijeongbu,KR',
  'uijeongbu': 'Uijeongbu,KR',
  '평택': 'Pyeongtaek,KR',
  'pyeongtaek': 'Pyeongtaek,KR',
  '구미': 'Gumi,KR',
  'gumi': 'Gumi,KR',
  '경주': 'Gyeongju,KR',
  'gyeongju': 'Gyeongju,KR',
};

function getSearchQuery(query: string): string {
  const trimmed = query.trim();
  const normalized = trimmed.toLowerCase();
  
  if (KOREAN_CITY_MAP[normalized]) {
    return KOREAN_CITY_MAP[normalized];
  }
  
  if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(trimmed) && !trimmed.includes(',')) {
    return `${trimmed},KR`;
  }
  
  return trimmed;
}

// === HANDLER FOR VERCEL SERVERLESS FUNCTION ===
export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const city = (req.query.q as string) || 'Seoul';
  let apiKey = process.env.OPENWEATHER_API_KEY;

  if (apiKey) {
    apiKey = apiKey.trim();
    if (apiKey.startsWith('"') && apiKey.endsWith('"')) {
      apiKey = apiKey.slice(1, -1).trim();
    } else if (apiKey.startsWith("'") && apiKey.endsWith("'")) {
      apiKey = apiKey.slice(1, -1).trim();
    }
  }

  const keyLength = apiKey ? apiKey.length : 0;
  const maskedKey = apiKey && apiKey.length > 6 
    ? `${apiKey.slice(0, 4)}***${apiKey.slice(-4)}` 
    : apiKey 
      ? '유효하지 않은 짧은 키' 
      : '없음';

  const hasRealApiKey = apiKey && apiKey !== 'YOUR_OPENWEATHER_API_KEY' && apiKey.trim() !== '';

  if (!hasRealApiKey) {
    try {
      const mockData = generateMockWeather(city);
      return res.status(200).json({
        ...mockData,
        warning: '실시간 날씨 검색을 원하시면 설정 또는 .env 파일에 OPENWEATHER_API_KEY를 설정해주세요. 현재 시뮬레이션 상태입니다. (감지된 키 없음)'
      });
    } catch (e) {
      console.error('Error generating mock weather:', e);
      return res.status(500).json({ error: '날씨 데이터를 생성하는 중 오류가 발생했습니다.' });
    }
  }

  try {
    const apiQuery = getSearchQuery(city);
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(apiQuery)}&appid=${apiKey}&units=metric&lang=kr`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(apiQuery)}&appid=${apiKey}&units=metric&lang=kr`;

    const [weatherRes, forecastRes] = await Promise.all([
      fetch(weatherUrl),
      fetch(forecastUrl),
    ]);

    if (!weatherRes.ok) {
      if (weatherRes.status === 404) {
        return res.status(404).json({ error: `도시 '${city}'를 찾을 수 없습니다.` });
      }
      if (weatherRes.status === 401 || weatherRes.status === 403) {
        try {
          const fallbackMock = generateMockWeather(city);
          return res.status(200).json({
            ...fallbackMock,
            isDemo: true,
            apiError: true,
            warning: `입력된 OpenWeatherMap API 키가 올바르지 않거나 아직 활성화되지 않았습니다 (API 응답코드: ${weatherRes.status}).\n\n[진단 정보]\n- 로드된 키 길이: ${keyLength}자리\n- 감지된 키 패턴: ${maskedKey}\n\n*참고: OpenWeatherMap 회원가입 후 새로 발급받은 API 키는 서버 시스템에서 승인/활성화되기까지 보통 1~2시간이 소요됩니다. 조금 뒤에 다시 시도해 보세요.`,
          });
        } catch (e) {
          return res.status(500).json({ error: '날씨 시뮬레이션 데이터를 생성하는 중 오류가 발생했습니다.' });
        }
      }
      throw new Error(`OpenWeatherMap weather error: ${weatherRes.statusText}`);
    }

    if (!forecastRes.ok) {
      throw new Error(`OpenWeatherMap forecast error: ${forecastRes.statusText}`);
    }

    const weatherData = await weatherRes.json();
    const forecastData = await forecastRes.json();

    const current: CurrentWeather = {
      city: weatherData.name,
      country: weatherData.sys.country,
      temp: weatherData.main.temp,
      feelsLike: weatherData.main.feels_like,
      tempMin: weatherData.main.temp_min,
      tempMax: weatherData.main.temp_max,
      humidity: weatherData.main.humidity,
      windSpeed: weatherData.wind.speed,
      windDeg: weatherData.wind.deg,
      pressure: weatherData.main.pressure,
      sunrise: weatherData.sys.sunrise,
      sunset: weatherData.sys.sunset,
      condition: {
        id: weatherData.weather[0].id,
        main: weatherData.weather[0].main as any,
        description: weatherData.weather[0].description,
        icon: weatherData.weather[0].icon,
      },
      dt: weatherData.dt,
    };

    const forecast: ForecastItem[] = forecastData.list.map((item: any) => ({
      dt: item.dt,
      temp: item.main.temp,
      feelsLike: item.main.feels_like,
      humidity: item.main.humidity,
      condition: {
        id: item.weather[0].id,
        main: item.weather[0].main as any,
        description: item.weather[0].description,
        icon: item.weather[0].icon,
      },
      windSpeed: item.wind.speed,
      pop: item.pop || 0,
    }));

    const result: WeatherData = {
      isDemo: false,
      current,
      forecast,
    };

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error fetching OpenWeatherMap API:', error);
    try {
      const fallbackMock = generateMockWeather(city);
      return res.status(200).json({
        ...fallbackMock,
        isDemo: true,
        warning: '실시간 API 호출에 실패하여 데모 모드로 표시됩니다. 인터넷 연결 혹은 API 키 상태를 확인하세요.',
      });
    } catch (e) {
      return res.status(500).json({ error: '서버 에러가 발생했습니다. 잠시 후 다시 시도해 주세요.' });
    }
  }
}
