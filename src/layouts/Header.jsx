import { NavLink } from "react-router-dom";

const Header = () => {
  return (
    <div className="w-full max-w-[92rem] mx-auto bg-cover bg-center p-6 sm:p-8 text-[#F3F0E9] bg-[#27445D] m-2 rounded-2xl bg-[url('https://cdn.pixabay.com/photo/2021/11/04/16/54/sky-6768714_1280.jpg')] bg-no-repeat opacity-80">
      <h1 className="text-lg sm:text-2xl font-bold text-white text-center">
        Weather Comparison: IGA Airport - January 25, 2022
      </h1>
      <p className="text-sm sm:text-md text-gray-400 text-center">
        Assessing weather conditions with ERA5 reanalysis and METAR observations
        for aviation insights.
      </p>

      <nav className="flex justify-center sm:flex-row mt-6 gap-2 sm:gap-4">
        <NavLink
          to="/meteogram"
          className={({ isActive }) =>
            `px-4 sm:px-6 py-1 sm:py-2 text-sm sm:text-md font-semibold text-white 
            backdrop-blur-md rounded-full transition-all duration-300 shadow-md ${
              isActive
                ? "bg-gray-700 opacity-90 scale-105"
                : "bg-black opacity-50 hover:scale-105 hover:bg-opacity-20"
            }`
          }
        >
          Meteogram
        </NavLink>
        <NavLink
          to="/comparison"
          className={({ isActive }) =>
            `px-4 sm:px-6 py-1 sm:py-2 text-sm sm:text-md font-semibold text-white 
            backdrop-blur-md rounded-full transition-all duration-300 shadow-md ${
              isActive
                ? "bg-gray-700 opacity-90 scale-105"
                : "bg-black opacity-50 hover:scale-105 hover:bg-opacity-20"
            }`
          }
        >
          Comparison Graphs
        </NavLink>
        <NavLink
          to="/news"
          className={({ isActive }) =>
            `px-4 sm:px-6 py-1 sm:py-2 text-sm sm:text-md font-semibold text-white 
            backdrop-blur-md rounded-full transition-all duration-300 shadow-md ${
              isActive
                ? "bg-gray-700 opacity-90 scale-105"
                : "bg-black opacity-50 hover:scale-105 hover:bg-opacity-20"
            }`
          }
        >
          Weather News
        </NavLink>
      </nav>
    </div>
  );
};

export default Header;
