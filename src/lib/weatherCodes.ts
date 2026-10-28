export interface WeatherMeta {
  label: string;
  icon: string;
}

export function getWeatherMeta(code: number | null): WeatherMeta {
  switch (code) {
    case 0:
      return { label: 'Céu limpo', icon: '☀️' };
    case 1:
      return { label: 'Parcialmente nublado', icon: '🌤️' };
    case 2:
      return { label: 'Nublado', icon: '⛅' };
    case 3:
      return { label: 'Encoberto', icon: '☁️' };
    case 45:
    case 48:
      return { label: 'Nevoeiro', icon: '🌫️' };
    case 51:
    case 53:
    case 55:
      return { label: 'Chuvisco', icon: '🌦️' };
    case 56:
    case 57:
      return { label: 'Garoa gelada', icon: '🌧️' };
    case 61:
    case 63:
    case 65:
      return { label: 'Chuva', icon: '🌧️' };
    case 66:
    case 67:
      return { label: 'Chuva gelada', icon: '🌧️' };
    case 71:
    case 73:
    case 75:
    case 77:
      return { label: 'Neve', icon: '❄️' };
    case 80:
    case 81:
    case 82:
      return { label: 'Pancadas de chuva', icon: '🌦️' };
    case 85:
    case 86:
      return { label: 'Pancadas de neve', icon: '🌨️' };
    case 95:
    case 96:
    case 99:
      return { label: 'Trovoada', icon: '⛈️' };
    default:
      return { label: 'Condição indisponível', icon: '—' };
  }
}
