import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface CommuteWeather {
  temperatureCelsius: number | null;
  weatherCode: number | null;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
}

export async function fetchCommuteWeather(latitude: number, longitude: number, targetIso: string): Promise<CommuteWeather> {
  const targetHour = targetIso.slice(0, 13);
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weather_code&timezone=auto&forecast_days=3`
  );
  const payload = await response.json();
  const times: string[] = payload?.hourly?.time ?? [];
  const temperatures: number[] = payload?.hourly?.temperature_2m ?? [];
  const codes: number[] = payload?.hourly?.weather_code ?? [];
  const index = times.findIndex((value) => value.startsWith(targetHour));
  const weatherCode = index >= 0 ? codes[index] ?? null : null;

  return {
    temperatureCelsius: index >= 0 ? temperatures[index] ?? null : null,
    weatherCode,
    ...mapWeatherCode(weatherCode)
  };
}

function mapWeatherCode(code: number | null) {
  if (code == null) {
    return { icon: 'weather-cloudy-clock' as const, label: 'Unknown' };
  }
  if (code === 0) {
    return { icon: 'weather-sunny' as const, label: 'Clear' };
  }
  if ([1, 2, 3].includes(code)) {
    return { icon: 'weather-partly-cloudy' as const, label: 'Cloudy' };
  }
  if ([45, 48].includes(code)) {
    return { icon: 'weather-fog' as const, label: 'Fog' };
  }
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
    return { icon: 'weather-rainy' as const, label: 'Rain' };
  }
  if ([56, 57, 66, 67].includes(code)) {
    return { icon: 'weather-snowy-rainy' as const, label: 'Freezing rain' };
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return { icon: 'weather-snowy' as const, label: 'Snow' };
  }
  if ([95, 96, 99].includes(code)) {
    return { icon: 'weather-lightning-rainy' as const, label: 'Storm' };
  }
  return { icon: 'weather-cloudy' as const, label: 'Weather' };
}
