import React from "react";

const WeatherNews = () => {
  const newsArticles = [
    {
      title: "Heavy snowfall causes travel chaos in Istanbul",
      url: "https://www.duvarenglish.com/heavy-snowfall-causes-travel-chaos-in-istanbul-news-60214",
    },
    {
      title: "Istanbul Airport closed due to heavy snowfall in Turkey",
      url: "https://aviationa2z.com/index.php/2022/01/25/istanbul-airport-closed-due-to-heavy-snowfall-in-turkey/",
    },
    {
      title: "From Istanbul to Athens, heavy snowfall causes travel chaos",
      url: "https://www.qatar-tribune.com/article/228300/WORLD/From-Istanbul-to-Athens-heavy-snowfall-causes-travel-chaos",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <h2 className="text-lg sm:text-2xl font-bold text-center text-gray-800 mb-4">
        Weather Impact Summary – January 25, 2022
      </h2>
      <p className="text-sm sm:text-md text-gray-600 text-center mb-6">
        Key weather-related news on the case study date.
      </p>

      <div className="bg-white shadow-lg rounded-lg p-4">
        <ul className="list-disc list-inside space-y-3">
          {newsArticles.map((article, index) => (
            <li
              key={index}
              className="text-[#3B76A2] hover:text-[#E35353] transition-all"
            >
              <a href={article.url} target="_blank" rel="noopener noreferrer">
                {article.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WeatherNews;
