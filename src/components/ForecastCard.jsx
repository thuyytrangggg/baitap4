"use client"

import "./ForecastCard.css"

const ForecastCard = ({ forecast, isToday, onDoubleClick }) => {
  const renderIcon = (IconComponent, size = 30) => {
    if (typeof IconComponent === "string") {
      return <span style={{ fontSize: `${size}px` }}>{IconComponent}</span>
    }
    const Icon = IconComponent
    return <Icon size={size} />
  }

  return (
    <div className={`forecast-card ${isToday ? "today" : ""}`} onDoubleClick={() => onDoubleClick(forecast)}>
      <div className="forecast-date">{forecast.date}</div>
      <div className="forecast-icon">{renderIcon(forecast.icon, 34)}</div>
      <div className="forecast-humidity">
        <span className="humidity-label">Humidity</span>
        <span className="humidity-value">{forecast.humidity}%</span>
      </div>
    </div> 
  )
}

export default ForecastCard
