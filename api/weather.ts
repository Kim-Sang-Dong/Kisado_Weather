import { generateMockWeather } from '../src/utils/mockGenerator.ts';
import { WeatherData, CurrentWeather, ForecastItem } from '../src/types.ts';

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

export default async function handler(req: any, res: any) {
  // CORS Headers for serverless environment if accessed cross-origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Get city from query
  const city = (req.query.q as string) || 'Seoul';
  let apiKey = process.env.OPENWEATHER_API_KEY;

  // Clean API key (remove quotes and spaces)
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
