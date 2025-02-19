import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import "./App.css";
import ComparisonPage from "./pages/ComparisonPage";
import MeteogramPage from "./pages/MeteogramPage";
import Header from "../src/layouts/Header";
import WeatherNews from "./pages/WeatherNews";

function App() {
  return (
    <Router>
      <div className="flex flex-col h-screen">
        <Header />
        <Routes>
          <Route path="/" element={<Navigate to="/meteogram" replace />} />
          <Route path="/meteogram" element={<MeteogramPage />} />
          <Route path="/comparison" element={<ComparisonPage />} />
          <Route path="/news" element={<WeatherNews />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
