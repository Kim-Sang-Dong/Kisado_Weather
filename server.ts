import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { generateMockWeather } from './src/utils/mockGenerator.ts';
import { WeatherData, CurrentWeather, ForecastItem, WeatherCondition } from './src/types.ts';

// Explicitly load dotenv if not already loaded (though process.env is injected)
import 'dotenv/config';

const app = express();
const PORT = 3000;

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
  
  // If query contains Hangul and does not have a comma, append ,KR
  if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(trimmed) && !trimmed.includes(',')) {
    return `${trimmed},KR`;
  }
  
  return trimmed;
}

// API routes
app.get('/api/weather', async (req, res) => {
  const city = (req.query.q as string) || 'Seoul';
  const apiKey = process.env.OPENWEATHER_API_KEY;

  // Check if API key is missing, empty, or a default placeholder
  const hasRealApiKey = apiKey && apiKey !== 'YOUR_OPENWEATHER_API_KEY' && apiKey.trim() !== '';

  if (!hasRealApiKey) {
    // Generate mock weather
    try {
      const mockData = generateMockWeather(city);
      return res.json(mockData);
    } catch (e) {
      console.error('Error generating mock weather:', e);
      return res.status(500).json({ error: '날씨 데이터를 생성하는 중 오류가 발생했습니다.' });
    }
  }

  // Fetch real OpenWeatherMap data
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
        console.warn(`[Weather API Warning] OpenWeatherMap returned status ${weatherRes.status}. Falling back to simulation mode.`);
        try {
          const fallbackMock = generateMockWeather(city);
          return res.json({
            ...fallbackMock,
            isDemo: true,
            apiError: true,
            warning: '입력된 OpenWeatherMap API 키가 올바르지 않거나 아직 활성화되지 않았습니다. 실시간 모드 대신 고성능 시뮬레이션 데이터로 자동 전환되었습니다.',
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

    // Map to unified schema
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

    return res.json(result);
  } catch (error: any) {
    console.error('Error fetching OpenWeatherMap API:', error);
    // Fall back to mock weather if OpenWeatherMap query fails, but flag it
    try {
      const fallbackMock = generateMockWeather(city);
      return res.json({
        ...fallbackMock,
        isDemo: true,
        warning: '실시간 API 호출에 실패하여 데모 모드로 표시됩니다. 인터넷 연결 혹은 API 키 상태를 확인하세요.',
      });
    } catch (e) {
      return res.status(500).json({ error: '서버 에러가 발생했습니다. 잠시 후 다시 시도해 주세요.' });
    }
  }
});

// Vite middleware configuration for serving frontend
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
