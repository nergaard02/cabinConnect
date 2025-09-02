import { useEffect, useState } from "react";

type Weather = {
    temperature: number | null;
    symbolCode: string | null;
    windSpeed: number | null;
    windDirection: number | null;
    humidity: number | null;
    uvIndex: number | null;
}

export const WeatherWidget: React.FC = () => {
    const [weather,  setWeather] = useState<Weather>({
        temperature: null,
        symbolCode: null,
        windSpeed: null,
        windDirection: null,
        humidity: null,
        uvIndex: null,
    });

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const response = await fetch
                    ("https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=61.2026&lon=8.2357",
                    {
                        headers: {
                            "User-Agent": "MyCabinApp/1.0 andreasnergaard02@gmail.com",
                        },
                    }
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch weather data");

                }

                const data = await response.json();
                const instant = data.properties.timeseries[0].data.instant.details;
                const symbolCode = data.properties.timeseries[0].data.next_1_hours?.summary?.symbol_code || null;

                console.log("weather data:", instant);

                setWeather({
                    temperature: instant.air_temperature ?? null,
                    symbolCode,
                    windSpeed: instant.wind_speed ?? null,
                    windDirection: instant.wind_from_direction ?? null,
                    humidity: instant.relative_humidity ?? null,
                    uvIndex: instant.ultraviolet_index_clear_sky ?? null,
                });
            } catch (err) {
                console.error("Error fetching weather data:", err);
            }
        };
        fetchWeather();
    }, []);

    return (
        <div className="bg-gray-800 text-white p-4 rounded-lg shadow w-fit mt-4">
            <h2 className="text-lg font-semibold mb-2">Current weather</h2>
            {weather.temperature !== null ? (
                <div className="flex items-center space-x-4">
                    {weather.symbolCode && (
                        <img
                            src={`https://api.met.no/images/weathericons/svg/${weather.symbolCode}.svg`}
                            alt={weather.symbolCode}
                            className="w-10 h-10"
                        />  
                    )}
                    <span className="text-xl">{weather.temperature}°C</span>
                </div>
            ) : (
                <p>Loading...</p>
            )}
            <div className="flex items-center space-x-2">
                <span>{weather.windSpeed ?? "N/A"} m/s</span>
                {weather.windDirection !== null && (
                    <div
                        title={`${weather.windDirection}°`}
                        className="w-6 h-6"
                        style={{
                            transform: `rotate(${weather.windDirection}deg)`
                        }}
                    >
                        {/* Simple arrow SVG pointing up by default, rotated by wind direction */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-6 h-6 text-white"
                        >
                            <line x1="12" y1="19" x2="12" y2="5" />
                            <polyline points="5 12 12 5 19 12" />
                        </svg>
                    </div>
                )}
            </div>
            {weather.humidity !== null && (
                <div className="flex items-center space-x-2 mb-1">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2"
                        viewBox="0 0 24 24">
                        <path d="M12 2.5C12 2.5 7 9 7 13a5 5 0 0010 0c0-4-5-10.5-5-10.5z" />
                    </svg>
                    <span>{weather.humidity}% humidity</span>
                </div>
            )}

            {weather.uvIndex !== null && (
                <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="5" />
                        <line x1="12" y1="1" x2="12" y2="3" />
                        <line x1="12" y1="21" x2="12" y2="23" />
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                        <line x1="1" y1="12" x2="3" y2="12" />
                        <line x1="21" y1="12" x2="23" y2="12" />
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                    <span>UV Index: {weather.uvIndex}</span>
                </div>
            )}
        </div>
    );
};