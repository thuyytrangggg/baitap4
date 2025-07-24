import "./WeatherCard.css"

const WeatherCard = ({ weather }) => {
  if (!weather) return null

  // Render icon based on whether it's a string (emoji) or a React component
  const renderIcon = (IconComponent, size = 64) => {
    if (typeof IconComponent === "string") {
      return <span style={{ fontSize: `${size}px` }}>{IconComponent}</span>
    }
    // Assuming IconComponent is a Lucide React component
    const Icon = IconComponent
    return <Icon size={size} />
  }

  return (
    <div className="weather-card">
      <div className="current-time">{weather.time}</div>

      <div className="main-weather">
        <div className="weather-icon">{renderIcon(weather.icon, 64)}</div>
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
