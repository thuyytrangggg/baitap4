import "./WeatherCard.css"

const WeatherCard = ({ weather }) => {
  if (!weather) return null

  return (
    <div className="weather-card">
      <div className="current-time">{weather.time}</div>

      <div className="main-weather">
        <div className="weather-icon">{weather.icon}</div>
        <div className="temperature">{weather.temperature}°F</div>
      </div>

      <div className="weather-condition">{weather.condition}</div>

      <div className="weather-details">
        <div className="detail-item">
          <span className="detail-label">Humidity</span>
          <span className="detail-value">{weather.humidity}%</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Wind speed</span>
          <span className="detail-value">{weather.windSpeed} km/j</span>
        </div>
      </div>
    </div>
  )
}

export default WeatherCard
