import { conditionToIcon } from "@components/icons/weatherIcons";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface WeatherData {
  tempC: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  city?: string;
}

export default function WeatherSnippet() {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  const { t } = useTranslation();

  useEffect(() => {
    const fetchWeather = async (lat?: number, lon?: number) => {
      let url = "https://wttr.in/?format=j1";

      // You can also request location-specific with lat/lon:
      if (lat !== undefined && lon !== undefined) {
        url = `https://wttr.in/${lat},${lon}?format=j1`;
      }

      try {
        const res = await fetch(url);
        const data = await res.json();

        const current = data.current_condition[0];
        setWeather({
          tempC: current.temp_C,
          description: current.weatherDesc[0].value,
          icon: conditionToIcon[current.weatherDesc[0].value] ?? conditionToIcon.default,
          city: data.nearest_area[0]?.areaName[0]?.value,
        });
      } catch (err) {
        console.error("Failed to fetch weather", err);
      }
    };

    // Try geolocation
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchWeather(latitude, longitude);
      },
      (err) => {
        console.warn("Geolocation failed, falling back to IP", err);
        fetchWeather(); // fallback to IP-based
      }
    );
  }, []);

  if (!weather) {
    return <span className="text-white text-xl">{t("Common.LoadingSuspension")}</span>;
  }

  return (
    <div className="flex flex-col items-center text-white mb-4">
      {weather.icon && <weather.icon className="w-24 h-24 mb-1" />}
      <span className="text-xl font-bold">{weather.tempC}°C</span>
      <span className="text-lg">{weather.city}</span>
    </div>
  );
}
