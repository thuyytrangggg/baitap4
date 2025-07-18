import "./ForecastCard.css"

const ForecastCard = ({ forecast, isToday }) => {
  return (
    <div className={`forecast-card ${isToday ? "today" : ""}`}>
      <div className="forecast-date">{forecast.date}</div>
      <div className="forecast-icon">{forecast.icon}</div>
      <div className="forecast-humidity">
        <span className="humidity-label">Humidity</span>
        <span className="humidity-value">{forecast.humidity}%</span>
      </div>
    </div>
  )
}

export default ForecastCard
