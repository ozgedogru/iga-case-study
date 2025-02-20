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
    hovertemplate: "Temperature: %{y:.2f}°C<extra></extra>",
  };

  const dewPointTrace = {
    x: timeLabels,
    y: selectedData.map((item) => item.dew_point),
    type: "scatter",
    mode: "lines",
    name: "Dew Point (°C)",
    line: { color: "#467EAC", width: 2 },
    hovertemplate: "Dew Point: %{y:.2f}°C<extra></extra>",
  };

  const pressureTrace = {
    x: timeLabels,
    y: selectedData.map((item) => item.pressure),
    type: "scatter",
    mode: "lines",
    name: "Pressure (hPa)",
    line: { color: "#3D8241", width: 2 },
    yaxis: "y2",
    hovertemplate: "Pressure: %{y:.2f} hPa<extra></extra>",
  };

  const precipitationTrace = {
    x: timeLabels,
    y: selectedData.map((item) => item.precipitation),
    type: "bar",
    name: "Precipitation (mm)",
    marker: { color: "#2A90BD", opacity: 0.7 },
    hovertemplate: "Precipitation: %{y:.2f} mm<extra></extra>",
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
    hovertemplate: "Wind Speed: %{y:.2f} kt<br><extra></extra>",
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
              className="text-sm sm:text-base font-medium px-3 sm:px-4 py-1 rounded-md transition-all duration-300 ease-in-out hover:text-sky-700"
            >
              {showTempInfo ? "Show Less Information" : "Show More Information"}
            </button>

            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                showTempInfo
                  ? "max-h-[1000px] opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className="text-start text-sm text-gray-600 mt-2 leading-relaxed">
                {useERA5 ? (
                  <>
                    <p>
                      {" "}
                      The temperature and dew point difference (T-Td) decreases
                      in the morning hours (~06:00) and drops to around -5°C.
                      This indicates that as the air becomes saturated, the risk
                      of condensation increases, which may lead to cloud
                      formation or fog. However, since the wind speed is around
                      15-16 kt at this time, condensation is more likely to form
                      low-level stratus clouds rather than fog.{" "}
                    </p>{" "}
                    <p>
                      {" "}
                      The pressure value decreases from 1023 hPa to 1019 hPa
                      throughout the day. A sudden drop around noon (~12:00) may
                      indicate a change in the weather system. This pressure
                      drop can signal an increase in cloud cover and a higher
                      chance of precipitation. As the temperature drops again in
                      the evening, condensation events may increase due to
                      values approaching the dew point temperature. This
                      situation may lead to reduced visibility, lower cloud
                      ceilings, and an increased chance of precipitation during
                      the night.{" "}
                    </p>{" "}
                    <h5>✈️ Aviation Effects</h5>{" "}
                    <p>
                      {" "}
                      In the morning, reduced visibility may occur due to
                      low-level cloud cover. The pressure drop may be linked to
                      an approaching weather system or increasing humidity. In
                      the evening, with the temperature dropping, a lower cloud
                      ceiling and reduced visibility should be expected.{" "}
                    </p>{" "}
                  </>
                ) : (
                  <>
                    <p>
                      {" "}
                      METAR data indicates that the difference between
                      temperature and dew point temperature remained
                      consistently stable throughout the day. While the
                      temperature stayed around -2°C, the dew point fluctuated
                      between -4°C and -6°C. This suggests that there was
                      constant humidity in the air, but it was not sufficient
                      for fog formation. While ERA5 data presents a humidity
                      profile that increases the likelihood of fog, METAR data
                      shows that due to the maintained difference between
                      temperature and dew point,{" "}
                      <span className="text-red-700">
                        low-level clouds (BKN)
                      </span>{" "}
                      were more dominant instead of fog.{" "}
                    </p>{" "}
                    <p>
                      {" "}
                      When examining pressure data, fluctuations between 1024
                      and 1028 hPa were observed throughout the day. A pressure
                      drop was detected in the afternoon and evening, indicating
                      a possible change in the air mass. These pressure
                      fluctuations can affect aircraft altimeter settings and
                      flight performance.{" "}
                    </p>{" "}
                  </>
                )}
              </div>
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
                className="text-sm sm:text-base font-medium px-3 sm:px-4 py-1 rounded-md transition-all duration-300 ease-in-out hover:text-sky-700"
              >
                {showPrecipitationInfo
                  ? "Show Less Information"
                  : "Show More Information"}
              </button>

              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  showPrecipitationInfo
                    ? "max-h-[1000px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="text-start text-sm text-gray-600 mt-2 leading-relaxed">
                  {" "}
                  <p>
                    {" "}
                    During the night (00:00 - 06:00), the amount of
                    precipitation is very low, and no significant rainfall is
                    expected. Starting from the morning hours (06:00 - 12:00),
                    the precipitation amount begins to increase, reaching its
                    highest level around 09:00 (~0.1 mm). Considering that the
                    temperature is close to 0°C at this time, there is a high
                    chance of mixed rain and snow or light snowfall.{" "}
                  </p>{" "}
                  <p>
                    {" "}
                    In the afternoon, the precipitation decreases slightly but
                    continues, and it increases again towards the evening
                    (~21:00). Since the temperature drops again during this
                    period, the precipitation may turn into snow once more.{" "}
                  </p>{" "}
                  <h5>✈️ Aviation Effects</h5>{" "}
                  <p>
                    {" "}
                    The morning precipitation may cause icing on the runway
                    surface. Although the precipitation decreases in the
                    afternoon, it still continues, which may lead to water
                    accumulation on the runway or a slippery surface due to
                    melting snow. In the evening, the increasing precipitation
                    and decreasing temperature may bring the risk of snowfall,
                    possibly causing accumulation on the runway.{" "}
                  </p>{" "}
                </div>
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
                className="text-start text-sm sm:text-base font-medium px-3 sm:px-4 py-1 rounded-md transition-all duration-300 ease-in-out hover:text-sky-700"
              >
                {showPrecipitationInfo
                  ? "Show Less Information"
                  : "Show More Information"}
              </button>

              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out text-start text-sm text-gray-600 ${
                  showPrecipitationInfo
                    ? "max-h-[1000px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <p>
                  METAR data indicates that periodic light snow showers (-SHSN)
                  were observed between 09:00 and 16:00, along with a brief
                  period of light rain showers (-SHRA) around noon (12:00 -
                  13:00). In ERA5 temperature data, the 0°C isotherm was briefly
                  exceeded during midday, supporting the rain event reported in
                  METAR.
                </p>
                <p>
                  From an aviation operations perspective, the ongoing snow
                  showers from the morning can cause accumulation and
                  slipperiness on the runway surface, potentially affecting
                  braking distances. The light rain showers observed around noon
                  may partially melt the snow on the runway, increasing{" "}
                  <span className="text-red-700">the risk of refreezing</span>{" "}
                  when temperatures drop again. This raises the possibility of
                  ice formation on the runway, creating a critical factor for
                  takeoff and landing operations. In the afternoon and evening,
                  the resumption of snow showers may further reduce{" "}
                  <span className="text-red-700">
                    runway friction and decrease visibility.
                  </span>
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
                showWindInfo
                  ? "max-h-[1000px] opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <p className="text-start text-sm text-gray-600 mt-2 leading-relaxed">
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
                    <p>
                      {" "}
                      According to METAR data, wind speed increased to 25 kt
                      during the night and then gradually decreased throughout
                      the day, fluctuating between 15-18 kt. While ERA5 data
                      predicted lower wind speeds at night, METAR data indicates
                      that stronger winds were present during these hours.{" "}
                    </p>{" "}
                    <p>
                      {" "}
                      In the evening (~after 21:00), wind speed was observed to
                      increase again. This increase may be related to changes in
                      the air mass and has the potential to create{" "}
                      <span className="text-red-700">
                        turbulence at ground level
                      </span>
                      . While ERA5 data predicted more stable winds during the
                      night, METAR data showed more variability.{" "}
                    </p>
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
