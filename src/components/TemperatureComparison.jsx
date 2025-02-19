import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import Plot from "react-plotly.js";

const TemperatureComparison = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/data/era5_metar_comparison.csv");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const text = await response.text();
        console.log("CSV Dosya İçeriği:", text);

        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            setData(result.data);
            setIsLoading(false);
          },
          error: (err) => {
            console.error("CSV parse error:", err);
            setIsLoading(false);
          },
        });
      } catch (error) {
        console.error("CSV dosyasını alırken hata oluştu:", error);
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  const era5Temps = data.map((row) => parseFloat(row["ERA5 Temperature (°C)"]));
  const metarTemps = data.map((row) =>
    parseFloat(row["METAR Temperature (°C)"])
  );

  return (
    <div className="bg-white p-3 sm:p-4 shadow-lg rounded-lg overflow-hidden w-full">
      <h3 className="text-sm sm:text-lg font-semibold text-gray-800 text-center mb-2">
        Temperature Comparison
      </h3>
      <div className="w-full overflow-x-auto">
        <Plot
          data={[
            {
              x: Array.from({ length: data.length }, (_, i) => i + 1),
              y: era5Temps,
              type: "scatter",
              mode: "lines+markers",
              name: "ERA5 Temperature (°C)",
              marker: { color: "509AD1" },
            },
            {
              x: Array.from({ length: data.length }, (_, i) => i + 1),
              y: metarTemps,
              type: "scatter",
              mode: "lines+markers",
              name: "METAR Temperature (°C)",
              marker: { color: "CC0000" },
            },
          ]}
          layout={{
            title: "ERA5 vs METAR Temperature Comparison",
            xaxis: { title: "Time / Index" },
            yaxis: { title: "Temperature (°C)" },
            autosize: true,
            responsive: true,
            height: window.innerWidth < 640 ? 250 : 300,
            legend: {
              x: 1,
              y: 1,
              xanchor: "right",
              yanchor: "top",
            },
            margin: { l: 50, r: 20, t: 30, b: 40 },
          }}
          className="w-full"
        />{" "}
      </div>
      <p>
        The ERA5 model generally follows the temperature trend observed in METAR
        data, but it tends to slightly overestimate temperatures. Short-term
        fluctuations seen in METAR, such as sudden drops or rises, are not fully
        captured by ERA5 due to its spatial averaging. A significant difference
        is observed around hour 20, where METAR shows a sharp increase in
        temperature, while ERA5 reacts more gradually. This suggests that while
        ERA5 provides a reliable long-term trend, it may not accurately capture
        rapid temperature changes in localized conditions.
      </p>
    </div>
  );
};

export default TemperatureComparison;
