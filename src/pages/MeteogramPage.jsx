import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import Papa from "papaparse";
import CustomSwitch from "../components/CustomSwitch";

const MeteogramPage = () => {
  const [useERA5, setUseERA5] = useState(true);
  const [era5Data, setEra5Data] = useState([]);
  const [metarData, setMetarData] = useState([]);
  const [selectedData, setSelectedData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showTempInfo, setShowTempInfo] = useState(false);
  const [showPrecipitationInfo, setShowPrecipitationInfo] = useState(false);
  const [showWindInfo, setShowWindInfo] = useState(false);

  const fetchCSV = async (url) => {
    const response = await fetch(url);
    const reader = response.body.getReader();
    const result = await reader.read();
    const text = new TextDecoder("utf-8").decode(result.value);
    const json = Papa.parse(text, { header: true }).data;

    return json.map((item) => ({
      time: item["Time"],
      temperature: parseFloat(item["Temperature (°C)"]),
      dew_point: parseFloat(item["Dew Point (°C)"]),
      pressure: parseFloat(item["Surface Pressure (hPa)"]),
      precipitation: parseFloat(item["Hourly Precipitation (mm)"]),
      wind_speed: parseFloat(item["Wind Speed (knots)"]),
      wind_direction: parseFloat(item["Wind Direction (°)"]),
      weather: item["Weather Event"] || "",
      metarReport: item["METAR Report"] || "",
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const era5Json = await fetchCSV("/data/era5_iga_20220125.csv");
        const metarJson = await fetchCSV(
          "/data/metar_decoded_LTFM_2022-01-25.csv"
        );

        console.log("ERA5 Data:", era5Json);
        console.log("METAR Data:", metarJson);

        setEra5Data(era5Json);
        setMetarData(metarJson);
        setSelectedData(era5Json);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setSelectedData(useERA5 ? era5Data : metarData);
  }, [useERA5, era5Data, metarData]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!selectedData || selectedData.length === 0) {
    return (
      <div className="text-center text-gray-600 mt-6">Loading data...</div>
    );
  }

  const timeLabels = selectedData.map((item) => item.time);

  const extractWeatherFromMETAR = (metarReport) => {
    if (!metarReport) return null;

    const events = Object.keys(weatherIcons).filter((code) =>
      metarReport.includes(code)
    );

    if (events.length > 0) {
      return {
        icon: events.map((event) => weatherIcons[event].icon).join(" "),
        label: events.map((event) => weatherIcons[event].label).join(", "),
      };
    }
    return null;
  };

  const temperatureTrace = {
    x: timeLabels,
    y: selectedData.map((item) => item.temperature),
    type: "scatter",
    mode: "lines",
    name: "Temperature (°C)",
    line: { color: "#D93232", width: 2 },
  };

  const dewPointTrace = {
    x: timeLabels,
    y: selectedData.map((item) => item.dew_point),
    type: "scatter",
    mode: "lines",
    name: "Dew Point (°C)",
    line: { color: "#467EAC", width: 2 },
  };

  const pressureTrace = {
    x: timeLabels,
    y: selectedData.map((item) => item.pressure),
    type: "scatter",
    mode: "lines",
    name: "Pressure (hPa)",
    line: { color: "#3D8241", width: 2 },
    yaxis: "y2",
  };

  const precipitationTrace = {
    x: timeLabels,
    y: selectedData.map((item) => item.precipitation),
    type: "bar",
    name: "Precipitation (mm)",
    marker: { color: "#2A90BD", opacity: 0.7 },
  };

  const weatherIcons = {
    "-SHSN": { icon: "❄️", label: "Light Snow Showers" },
    SHSN: { icon: "❄️", label: "Snow Showers" },
    "-SHRA": { icon: "🌧️", label: "Light Rain Showers" },
    SHRA: { icon: "🌧️", label: "Rain Showers" },
    TSRA: { icon: "⛈️", label: "Thunderstorm Rain" },
    DZ: { icon: "🌫️", label: "Drizzle" },
    FG: { icon: "🌁", label: "Fog" },
  };

  const weatherEvents = selectedData
    .map((item) => {
      const event = extractWeatherFromMETAR(item.metarReport);
      if (event) {
        return {
          time: item.time,
          icon: event.icon,
          label: event.label,
        };
      }
      return null;
    })
    .filter(Boolean);

  const weatherEventTrace = {
    x: weatherEvents.map((event) => event.time),
    y: Array(weatherEvents.length).fill(1),
    mode: "text",
    text: weatherEvents.map((event) => event.icon),
    textfont: { size: window.innerWidth < 640 ? 10 : 14 },
    hoverinfo: "text",
    hovertext: weatherEvents.map((event) => `${event.label} (${event.time})`),
    showlegend: false,
  };

  const windTrace = {
    x: timeLabels,
    y: selectedData.map((item) => item.wind_speed),
    type: "scatter",
    mode: "lines+markers",
    name: "Wind Speed (kt)",
    marker: {
      color: selectedData.map((item) =>
        item.wind_speed > 20 ? "#B41919" : "#757575"
      ),
    },
    line: {
      color: "#757575",
      width: 1,
      opacity: 0.8,
    },
  };

  const getArrowIcon = (angle) => {
    if (angle >= 337.5 || angle < 22.5) return "🡩";
    if (angle >= 22.5 && angle < 67.5) return "🡥";
    if (angle >= 67.5 && angle < 112.5) return "🡲";
    if (angle >= 112.5 && angle < 157.5) return "🡦";
    if (angle >= 157.5 && angle < 202.5) return "🡣";
    if (angle >= 202.5 && angle < 247.5) return "🡧";
    if (angle >= 247.5 && angle < 292.5) return "🡰";
    if (angle >= 292.5 && angle < 337.5) return "🡤";
    return "❓";
  };

  const windArrowTrace = {
    x: timeLabels,
    y: selectedData.map((item) => item.wind_speed + 1),
    mode: "text",
    text: selectedData.map((item) => getArrowIcon(item.wind_direction)),
    textfont: {
      size: 14,
      color: selectedData.map((item) =>
        item.wind_speed > 20 ? "#A5485D" : "#757575"
      ),
    },
    showlegend: false,
  };

  return (
    <div className="p-4 sm:p-6 flex flex-col items-center w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between w-full sm:w-1/3 md:w-1/4 bg-[#27445D] text-white p-4 py-2 rounded-4xl mb-6 shadow-md">
        <span className="text-lg font-semibold">METAR</span>
        <CustomSwitch checked={useERA5} onChange={() => setUseERA5(!useERA5)} />
        <span className="text-lg font-semibold">ERA5</span>
      </div>

      <div className="flex flex-col gap-6 w-full">
        <div className="bg-white p-3 sm:p-4 shadow-2xl rounded-lg w-full">
          <h3 className="text-lg font-bold text-gray-700 mb-2 ml-4 text-start">
            Temperature (°C) & Pressure (hPa)
          </h3>
          <div className="w-full overflow-x-auto">
            <Plot
              data={[temperatureTrace, dewPointTrace, pressureTrace]}
              layout={{
                title: "",
                yaxis: {
                  title: "Temperature (°C)",
                },
                yaxis2: {
                  title: "Pressure (hPa)",
                  overlaying: "y",
                  side: "right",
                },
                autosize: true,
                responsive: true,
                height: window.innerWidth < 640 ? 250 : 300,
                margin: { l: 50, r: 30, t: 10, b: 40 },
                legend: {
                  x: 0.5,
                  y: -0.2,
                  xanchor: "center",
                  yanchor: "top",
                  orientation: "h",
                },
              }}
              className="w-full"
            />
            <button
              onClick={() => setShowTempInfo(!showTempInfo)}
              className="text-sm sm:text-base font-medium px-3 sm:px-4 py-2 mt-2 rounded-md transition-all duration-300 ease-in-out hover:text-sky-700"
            >
              {showTempInfo ? "Show Less Information" : "Show More Information"}
            </button>

            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                showTempInfo ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                {useERA5 ? (
                  <>
                    The temperature remains below freezing throughout the day,
                    ranging from -4°C to -1°C, indicating a high risk of{" "}
                    <span className="text-red-700">icing</span>. The dew point
                    temperature fluctuates between -2°C and -6°C, suggesting
                    high humidity levels at certain times. The atmospheric
                    pressure gradually decreases from 1022 hPa to 1019 hPa,
                    indicating weak low-pressure influence. Given the freezing
                    temperatures, de-icing and anti-icing procedures might be
                    necessary for safe flight operations.
                  </>
                ) : (
                  <>
                    Throughout the day, temperatures remained below freezing
                    (~-2°C to -4°C), with dew point temperatures closely
                    matching air temperature, indicating high humidity and a
                    potential risk of{" "}
                    <span className="text-red-700">
                      fog or icing conditions
                    </span>
                    . The stable high-pressure system (1024-1028 hPa) suggests
                    relatively calm weather with no significant frontal
                    activity, but persistent cold conditions could have required
                    de-icing procedures for aircraft operations.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {useERA5 ? (
          <div className="bg-white p-3 sm:p-4 shadow-2xl rounded-lg w-full">
            <h3 className="text-lg font-bold text-gray-700 mb-2 ml-4 text-start">
              Hourly Precipitation (mm)
            </h3>
            <div className="w-full overflow-x-auto">
              <Plot
                data={[precipitationTrace]}
                layout={{
                  title: "",
                  yaxis: { title: "Precipitation (mm)" },
                  xaxis: { title: "Time" },
                  autosize: true,
                  responsive: true,
                  height: window.innerWidth < 640 ? 250 : 300,
                  margin: { l: 50, r: 30, t: 10, b: 40 },
                  legend: {
                    x: 0.5,
                    y: -0.2,
                    xanchor: "center",
                    yanchor: "top",
                    orientation: "h",
                  },
                }}
                className="w-full"
              />
              <button
                onClick={() => setShowPrecipitationInfo(!showPrecipitationInfo)}
                className="text-sm sm:text-base font-medium px-3 sm:px-4 py-2 mt-2 rounded-md transition-all duration-300 ease-in-out hover:text-sky-700"
              >
                {showPrecipitationInfo
                  ? "Show Less Information"
                  : "Show More Information"}
              </button>

              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  showPrecipitationInfo
                    ? "max-h-[200px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  The precipitation data shows intermittent light rainfall
                  throughout the day. The highest recorded amount is around 0.1
                  mm, which is not significant enough to cause major operational
                  disruptions. However, light rain may slightly wet the runway
                  surface, potentially affecting braking action. The increase in
                  precipitation during the evening hours should be monitored for
                  possible changes in runway conditions.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-3 sm:p-4 shadow-2xl rounded-lg w-full">
            <h3 className="text-lg font-bold text-gray-700 mb-2 ml-4 text-start">
              Weather Events (METAR)
            </h3>
            <div className="w-full overflow-x-auto">
              <Plot
                data={[weatherEventTrace]}
                layout={{
                  title: "",
                  yaxis: {
                    title: "",
                    showticklabels: false,
                    showgrid: false,
                  },
                  xaxis: { title: "Time" },
                  autosize: true,
                  responsive: true,
                  height: window.innerWidth < 640 ? 250 : 300,
                  margin: { l: 50, r: 30, t: 10, b: 40 },
                  legend: {
                    x: 0.5,
                    y: -0.2,
                    xanchor: "center",
                    yanchor: "top",
                    orientation: "h",
                  },
                }}
                className="w-full"
              />
              <button
                onClick={() => setShowPrecipitationInfo(!showPrecipitationInfo)}
                className="text-sm sm:text-base font-medium px-3 sm:px-4 py-2 mt-2 rounded-md transition-all duration-300 ease-in-out hover:text-sky-700"
              >
                {showPrecipitationInfo
                  ? "Show Less Information"
                  : "Show More Information"}
              </button>

              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  showPrecipitationInfo
                    ? "max-h-[200px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  The METAR reports indicate continuous snowfall (❄) throughout
                  the day, with a brief rain-snow mix around 12:00 UTC, possibly
                  due to temporary warming at certain altitudes. Prolonged
                  snowfall posed challenges for runway operations, potentially
                  reducing braking action and requiring frequent de-icing and
                  snow removal efforts. The low visibility associated with
                  snowfall likely necessitated the use of instrument approaches
                  (ILS) for safe landings. Additionally, snowfall and mixed
                  precipitation can significantly reduce visibility, affecting
                  approach procedures and increasing operational risks, even
                  though visibility data is not directly available in this
                  graph.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white p-4 shadow-2xl rounded-lg w-full">
          <h3 className="text-lg font-bold text-gray-700 mb-8 ml-4 text-start">
            Wind Speed
          </h3>
          <div className="w-full overflow-x-auto">
            <Plot
              data={[windTrace, windArrowTrace]}
              layout={{
                title: "",
                yaxis: { title: "Wind Speed (kt)" },
                xaxis: { title: "Time" },
                autosize: true,
                responsive: true,
                height: window.innerWidth < 640 ? 250 : 300,
                margin: { l: 50, r: 30, t: 10, b: 40 },
                legend: {
                  x: 0.5,
                  y: -0.2,
                  xanchor: "center",
                  yanchor: "top",
                  orientation: "h",
                },
              }}
              className="w-full"
            />
            <button
              onClick={() => setShowWindInfo(!showWindInfo)}
              className="text-sm sm:text-base font-medium px-3 sm:px-4 py-2 mt-2 rounded-md transition-all duration-300 ease-in-out hover:text-sky-700"
            >
              {showWindInfo ? "Show Less Information" : "Show More Information"}
            </button>

            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                showWindInfo ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                {useERA5 ? (
                  <>
                    The wind starts at approximately 20 knots around midnight
                    and gradually decreases to 10 knots by the end of the day.
                    The wind direction is predominantly from the west (around
                    270°), which means it creates
                    <span className="text-red-700">
                      {" "}
                      a significant crosswind component for Istanbul Airport's
                      runways
                    </span>{" "}
                    (approximately 340°-350°). An 18-knot crosswind component
                    may not be critical for large commercial aircraft but should
                    be carefully considered for training flights and smaller
                    aircraft operations.
                  </>
                ) : (
                  <>
                    Wind conditions showed strong winds (~22-25 knots) in the
                    early morning hours, gradually decreasing to 10-15 knots
                    later in the day. Wind direction remained mostly from the
                    west-northwest (WNW). The stronger winds in the early hours
                    may have caused{" "}
                    <span className="text-red-700">
                      moderate turbulence on approach and departure
                    </span>
                    , while the later reduction in wind speed provided more
                    favorable conditions for landing.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeteogramPage;
