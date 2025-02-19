import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";

const weatherIcons = {
  "-SHSN": { icon: "❄️", label: "Light Snow Showers" },
  SHSN: { icon: "❄️", label: "Snow Showers" },
  "-SHRA": { icon: "🌧️", label: "Light Rain Showers" },
  SHRA: { icon: "🌧️", label: "Rain Showers" },
  TSRA: { icon: "⛈️", label: "Thunderstorm Rain" },
  DZ: { icon: "🌫️", label: "Drizzle" },
  FG: { icon: "🌁", label: "Fog" },
};

const WeatherEventsGraph = () => {
  const [metarData, setMetarData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetarData = async () => {
      try {
        const response = await fetch("/data/metar_report.csv");
        const text = await response.text();

        const rows = text.split("\n").slice(1);
        const parsedData = rows
          .map((row) => {
            const columns = row.split(",");
            if (columns.length < 2) return null;
            return { time: columns[0].trim(), metar: columns[1].trim() };
          })
          .filter(Boolean);

        console.log("data > ", parsedData);
        setMetarData(parsedData);
        setLoading(false);
      } catch (error) {
        console.error("❌ METAR verisi alınırken hata oluştu:", error);
        setLoading(false);
      }
    };

    fetchMetarData();
  }, []);

  const extractCloudData = (metarString) => {
    const cloudRegex = /(FEW|SCT|BKN|OVC)(\d{3})/g;
    let match;
    let cloudCover = 0;
    let cloudLevels = [];

    while ((match = cloudRegex.exec(metarString)) !== null) {
      const coverType = match[1];
      const altitude = parseInt(match[2]) * 100;

      cloudLevels.push(altitude);

      if (coverType === "FEW") cloudCover += 10;
      if (coverType === "SCT") cloudCover += 30;
      if (coverType === "BKN") cloudCover += 60;
      if (coverType === "OVC") cloudCover = 100;
    }

    return { cloudCover, cloudLevels };
  };

  const extractWeatherEvents = (metarString) => {
    const events = Object.keys(weatherIcons).filter((code) =>
      metarString.includes(code)
    );
    return events.map((code) => ({
      icon: weatherIcons[code].icon,
      label: weatherIcons[code].label,
    }));
  };

  if (loading) return <p>Loading METAR data...</p>;

  const firstMetar = metarData.length > 0 ? metarData[0].metar : "";
  const { cloudCover, cloudLevels } = extractCloudData(firstMetar);
  const weatherEvents = extractWeatherEvents(firstMetar);

  const weatherEventTrace = {
    x: metarData.map((item) => item.time),
    y: Array(metarData.length).fill(1),
    mode: "text",
    text: metarData.map((item) =>
      extractWeatherEvents(item.metar)
        .map((e) => e.icon)
        .join(" ")
    ),
    textfont: { size: 20 },
    hoverinfo: "text",
    hovertext: metarData.map(
      (item) =>
        extractWeatherEvents(item.metar)
          .map((e) => `${e.label} (${item.time})`)
          .join(", ") || "No significant weather"
    ),
    showlegend: false,
  };

  return (
    <div className="relative w-full">
      <div
        className="absolute inset-x-0 top-0 cloud-layer"
        style={{
          opacity: cloudCover / 100,
          height: cloudLevels.length > 0 ? `${cloudLevels[0] / 100}px` : "50px",
          animationDuration: `${90 - cloudCover}s`,
        }}
      ></div>

      <div className="bg-white p-2 shadow-lg rounded-lg w-full relative">
        <h3 className="text-lg text-left font-bold text-gray-700">
          Weather Events (METAR)
        </h3>
        <Plot
          data={[weatherEventTrace]}
          layout={{
            title: "Weather Events Over Time",
            yaxis: { showticklabels: false, showgrid: false },
            xaxis: { title: "Time" },
            autosize: true,
            responsive: true,
            height: 300,
            width: 900,
            paper_bgcolor: "rgba(0,0,0,0)",
          }}
          className="w-full bg-transparent"
        />
      </div>
    </div>
  );
};

export default WeatherEventsGraph;
