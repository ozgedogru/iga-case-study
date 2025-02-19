import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import Plot from "react-plotly.js";

const WindComparison = () => {
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
            console.error("CSV parse hatası:", err);
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
    return <h1>Veri Yükleniyor...</h1>;
  }

  const era5WindSpeed = data.map((row) =>
    parseFloat(row["ERA5 Wind Speed (knots)"])
  );
  const metarWindSpeed = data.map((row) =>
    parseFloat(row["METAR Wind Speed (knots)"])
  );

  return (
    <div className="bg-white p-3 sm:p-4 shadow-lg rounded-lg overflow-hidden w-full">
      <h3 className="text-sm sm:text-lg font-semibold text-gray-800 text-center mb-2">
        Wind Speed Comparison
      </h3>{" "}
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
            },
            {
              x: Array.from({ length: data.length }, (_, i) => i + 1),
              y: metarWindSpeed,
              type: "scatter",
              mode: "lines+markers",
              name: "METAR Wind Speed (knots)",
              marker: { color: "#CC0000" },
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
        />
      </div>
      <p>
        The ERA5 model effectively represents the overall decreasing trend of
        wind speed throughout the day. However, it underestimates the peak wind
        speeds observed in METAR, particularly in the early hours. METAR records
        stronger initial winds (~22 knots), while ERA5 starts at a lower value
        (~19 knots). After hour 10, the two datasets align more closely. This
        indicates that ERA5 is reliable for general wind trends, but caution is
        needed when using it for high-wind conditions, as it may smooth out
        extreme values.
      </p>
    </div>
  );
};

export default WindComparison;
