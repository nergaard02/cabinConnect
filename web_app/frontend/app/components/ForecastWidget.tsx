import { useEffect, useState } from  "react";

interface ForecastDay {
    date: string;
    symbolCode: string;
    temperature: number;
}

export const ForecastWidget: React.FC = () => {
    const [forecast, setForecast] = useState<ForecastDay[]>([]);
    const YR_LOGO_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/YR_logo_blaa_rgb.png/200px-YR_logo_blaa_rgb.png";


    useEffect(() => {
        const fetchForecast = async () => {
            try {
                const response = await fetch(
                    "https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=61.2026&lon=8.2357",
                {
                    headers: {
                        "User-Agent": "MyCabinApp/1.0 andreasnergaard02@gmail.com",
                    },
                }
                )

                if (!response.ok) {
                    throw new Error("Failed to fetch forecast data");
                }

                const data = await response.json();
                const timeseries = data.properties.timeseries;

                // Filter out the information from the next 5 days at 12:00 UTC
                const daily = timeseries.filter((entry: any) => {
                    return entry.time.includes("T12:00:00Z");
                }).slice(0, 5)

                console.log("forecast data:", daily);

                // Map through the daily array. For each entry, create a new object matching the ForeCastDay shape
                // Return an arry of formatted ForecastDay objects
                const formatted: ForecastDay[] = daily.map((entry: any) => ({
                    date: entry.time,
                    symbolCode: 
                    entry.data.next_1_hours?.summary?.symbol_code
                    || entry.data.next_6_hours?.summary?.symbol_code
                    || entry.data.next_12_hours?.summary?.symbol_code
                    || "",
                    temperature: entry.data.instant.details.air_temperature,
                }));

                setForecast(formatted);
            } catch (err) {
                console.error("Error fetching forecast data:", err);
            }
        };
        fetchForecast();
    }, []);

    return (
        <div className="bg-gray-800 text-white p-4 rounded-lg shadow w-full mt-4">
            <h2 className="text-lg font-semibold mb-2">Long-Term Forecast</h2>
            <p className="text-sm text-gray-400 mb-3">Daily forecast snapshot at 12.00</p>
            
            {/* Forecast Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 flex-1">
                {forecast.map((day, idx) => {
                    const date = new Date(day.date);
                    const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
                    const dayMonth = date.toLocaleDateString("en-US", { day: "numeric", month: "short" });

                    return (
                    <div
                        key={idx}
                        className="flex flex-col items-center justify-center bg-gray-700 p-4 rounded-lg shadow"
                    >
                        <span className="text-sm font-medium">{weekday}</span>
                        <span className="text-sm text-gray-400 mb-1">{dayMonth}</span>
                        <img
                        src={`https://api.met.no/images/weathericons/svg/${day.symbolCode}.svg`}
                        alt={day.symbolCode}
                        className="w-8 h-8"
                        />
                        <span className="text-base font-semibold">
                        {day.temperature}°C
                        </span>
                    </div>
                    );
                })}
            </div>


            <p className="text-xs text-gray-400 mt-2 flex items-center space-x-2">
                <span>
                    Weather data and icons from{' '}
                    <a href="https://www.yr.no" className="underline hover:text-white" target="_blank" rel="noopener noreferrer">
                    MET Norway (yr.no)
                    </a>
                </span>
                <a
                    href="https://www.yr.no"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Weather data provided by yr.no"
                >
                    <img
                    src="https://info.nrk.no/wp-content/uploads/2019/09/YR_blaa_rgb.png"
                    alt="yr.no"
                    className="h-6 opacity-60 hover:opacity-100 transition-opacity"
                    />
                </a>
            </p>
        </div>
    );
};