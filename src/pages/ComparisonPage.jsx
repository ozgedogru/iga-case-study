import React from "react";
import TemperatureComparison from "../components/TemperatureComparison";
import WindComparison from "../components/WindComparison";
import PressureComparison from "../components/PressureComparison";
import HumidityComparison from "../components/HumidityComparison";

const ComparisonPage = () => {
  return (
    <div className="p-4 sm:p-6 w-full grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 items-stretch max-w-7xl mx-auto">
      <TemperatureComparison />
      <WindComparison />
      <PressureComparison />
      <HumidityComparison />
    </div>
  );
};

export default ComparisonPage;
