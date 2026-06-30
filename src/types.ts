export interface WeatherCondition {
  id: number;
  main: 'Clear' | 'Clouds' | 'Rain' | 'Snow' | 'Thunderstorm' | 'Drizzle' | 'Mist';
  description: string;
  icon: string;
}

export interface CurrentWeather {
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

export interface ForecastItem {
  dt: number; // timestamp
  temp: number;
  feelsLike: number;
  humidity: number;
  condition: WeatherCondition;
  windSpeed: number;
  pop: number; // probability of precipitation (0 to 1)
}

export interface WeatherData {
  isDemo: boolean;
  current: CurrentWeather;
  forecast: ForecastItem[];
  apiError?: boolean;
  warning?: string;
}
