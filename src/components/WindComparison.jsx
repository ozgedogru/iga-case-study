import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import Plot from "react-plotly.js";

const WindComparison = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rmse, setRmse] = useState(null);
  const [bias, setBias] = useState(null);

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
            const parsedData = result.data;
            setData(parsedData);
            calculateErrorMetrics(parsedData);
            setIsLoading(false);
          },
          error: (err) => {
            console.error("CSV parse error:", err);
            setIsLoading(false);
          },
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const calculateErrorMetrics = (data) => {
    const era5WindSpeed = data.map((row) =>
      parseFloat(row["ERA5 Wind Speed (knots)"])
    );
    const metarWindSpeed = data.map((row) =>
      parseFloat(row["METAR Wind Speed (knots)"])
    );

    const n = era5WindSpeed.length;
    const squaredErrors = era5WindSpeed.map(
      (e, i) => (e - metarWindSpeed[i]) ** 2
    );
    const biases = era5WindSpeed.map((e, i) => e - metarWindSpeed[i]);

    setRmse(Math.sqrt(squaredErrors.reduce((a, b) => a + b, 0) / n).toFixed(2));
    setBias((biases.reduce((a, b) => a + b, 0) / n).toFixed(2));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  const era5WindSpeed = data.map((row) =>
    parseFloat(row["ERA5 Wind Speed (knots)"])
  );
  const metarWindSpeed = data.map((row) =>
    parseFloat(row["METAR Wind Speed (knots)"])
  );

  return (
    <div className="relative bg-white p-3 sm:p-4 shadow-lg rounded-lg w-full max-w-full min-w-0 min-h-[200px]">
      <h3 className="text-sm sm:text-lg font-semibold text-gray-800 text-center pt-4 mb-2">
        Wind Speed Comparison
      </h3>

      <div className="w-full overflow-x-auto">
        <Plot
          data={[
            {
              x: Array.from({ length: data.length }, (_, i) => i + 1),
              y: era5WindSpeed,
              type: "scatter",
              mode: "lines+markers",
              name: "ERA5 Wind Speed (knots)",
              marker: { color: "#509AD1" },
              line: { color: "#509AD1" },
              hovertemplate: "ERA5 Wind: %{y} knots<extra></extra>",
            },
            {
              x: Array.from({ length: data.length }, (_, i) => i + 1),
              y: metarWindSpeed,
              type: "scatter",
              mode: "lines+markers",
              name: "METAR Wind Speed (knots)",
              marker: { color: "#CC0000" },
              line: { color: "#CC0000" },
              hovertemplate: "METAR Wind: %{y} knots<extra></extra>",
            },
          ]}
          layout={{
            title: "ERA5 vs METAR Wind Speed Comparison",
            xaxis: { title: "Time / Index" },
            yaxis: { title: "Wind Speed (knots)", showgrid: false },
            autosize: true,
            responsive: true,
            height: window.innerWidth < 640 ? 250 : 300,
            legend: { x: 1.2, y: 1.2, xanchor: "right", yanchor: "top" },
            margin: { l: 50, r: 80, t: 30, b: 40 },
          }}
          className="w-full"
        />
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <div className="group relative bg-gray-100 p-1 rounded-md shadow-md text-center w-24 sm:w-28 h-8 flex items-center justify-between px-1">
          <p className="text-[11px] sm:text-xs font-semibold text-gray-700">
            🛑 RMSE
          </p>
          <p className="text-xs sm:text-sm font-semibold text-red-600">
            {rmse} kt
          </p>
          <div className="absolute hidden group-hover:flex items-center justify-center bg-black text-white text-[10px] sm:text-xs rounded-md p-2 top-[-40px] left-1/2 transform -translate-x-1/2 w-auto max-w-[160px] shadow-lg z-50">
            Measures the average error magnitude; higher RMSE indicates greater
            prediction variability and inaccuracies.{" "}
          </div>
        </div>
        <div className="group relative bg-gray-100 p-1 rounded-md shadow-md text-center w-24 sm:w-28 h-8 flex items-center justify-between px-1">
          <p className="text-[11px] sm:text-xs font-semibold text-gray-700">
            ↔ Bias
          </p>
          <p className="text-xs sm:text-sm font-semibold text-green-600">
            {bias} kt
          </p>
          <div className="absolute hidden group-hover:flex items-center justify-center bg-black text-white text-[10px] sm:text-xs rounded-md p-2 top-[-40px] left-1/2 transform -translate-x-1/2 w-auto max-w-[160px] shadow-lg z-50">
            Shows the systematic deviation of model predictions; positive bias
            means overestimation, negative bias means underestimation.{" "}
          </div>
        </div>
      </div>

      <div className="mt-2 p-4 bg-gray-100 rounded-lg shadow max-w-full">
        <p className="text-sm text-gray-700 mt-2">
          The ERA5 model accurately captures the general decreasing trend in
          wind speed; however, it tends to underestimate higher wind speeds
          (Bias: -1.84 kt), particularly in the early hours, compared to METAR
          data. Although the two datasets align more closely as the day
          progresses, ERA5 appears to smooth out extreme wind conditions and
          fails to capture sudden changes.
        </p>
      </div>
    </div>
  );
};

export default WindComparison;
