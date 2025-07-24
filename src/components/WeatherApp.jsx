"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { setWeatherData, setLoading, setError } from "../store/weatherSlice"
import WeatherCard from "./WeatherCard"
import TemperatureChart from "./TemperatureChart"
import ForecastCard from "./ForecastCard"
import Modal from "./Modal"
import "./WeatherApp.css"

import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudFog, Cloudy } from "lucide-react"

const WeatherApp = () => {
  const [city, setCity] = useState("Hanoi")
  const [searchCity, setSearchCity] = useState("Hanoi")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDayData, setSelectedDayData] = useState(null)
  const dispatch = useDispatch()
  const { currentWeather, forecast, temperatureData, loading, error } = useSelector((state) => state.weather)

  useEffect(() => {
    fetchWeatherData(searchCity)
  }, [])

  const fetchWeatherData = async (cityName) => {
    dispatch(setLoading(true))
    try {
      const apiKey = import.meta.env.VITE_WEATHER_API_KEY

      const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${cityName}&days=4&aqi=no&alerts=yes`
      )


      if (!response.ok) {
        throw new Error("Không thể tìm thấy thành phố. Vui lòng thử lại.")
      }

      const data = await response.json()

      const current = {
        temperature: data.current.temp_f,
        condition: data.current.condition.text,
        humidity: data.current.humidity,
        windSpeed: data.current.wind_kph,
        uv: data.current.uv,
        icon: getWeatherIcon(data.current.condition.code),
        time: formatDateTime(data.location.localtime),
        location: data.location.name + ", " + data.location.country,
      }

      const forecastData = data.forecast.forecastday.map((day) => ({
        date: formatDate(day.date),
        icon: getWeatherIcon(day.day.condition.code),
        humidity: day.day.avghumidity,
        minTemp: Math.round(day.day.mintemp_f),
        maxTemp: Math.round(day.day.maxtemp_f),
        hourly: day.hour.map((h) => ({
          time: formatHour(h.time),
          temp_f: h.temp_f,
          condition: h.condition,
          uv: h.uv,
          humidity: h.humidity,
          icon: getWeatherIcon(h.condition.code),
        })),
      }))

      const hourlyDataForChart = data.forecast.forecastday[0].hour
      const filteredHours = [0, 6, 12, 18, 23].map((hour) => {
        const hourData = hourlyDataForChart.find((h) => new Date(h.time).getHours() === hour) || hourlyDataForChart[0]
        return {
          time: formatHour(hourData.time),
          temp: Math.round(hourData.temp_f),
          uv: hourData.uv || 0,
          humidity: hourData.humidity,
        }
      })

      dispatch(
        setWeatherData({
          current,
          forecast: forecastData,
          temperatureData: filteredHours,
        }),
      )

      setSearchCity(cityName)
    } catch (err) {
      dispatch(setError(err.message))
    } finally {
      dispatch(setLoading(false))
    }
  }

  // Chuyển đổi mã điều kiện thời tiết thành Lucide React Component
  const getWeatherIcon = (code) => {
    switch (code) {
      case 1000: // Sunny / Clear
        return Sun
      case 1003: // Partly cloudy
        return Cloud
      case 1006: // Cloudy
      case 1009: // Overcast
        return Cloudy
      case 1030: // Mist
      case 1135: // Fog
      case 1147: // Freezing fog
        return CloudFog
      case 1063: // Patchy light rain
      case 1150: // Light drizzle
      case 1153: // Light drizzle
      case 1180: // Patchy light rain
      case 1183: // Light rain
      case 1186: // Moderate rain at times
      case 1189: // Moderate rain
      case 1240: // Light rain shower
      case 1243: // Moderate or heavy rain shower
        return CloudRain
      case 1066: // Patchy light snow
      case 1114: // Blowing snow
      case 1117: // Blizzard
      case 1210: // Light snow
      case 1213: // Light snow
      case 1216: // Moderate snow at times
      case 1219: // Moderate snow
      case 1255: // Light snow showers
      case 1258: // Moderate or heavy snow showers
        return CloudSnow
      case 1087: // Thundery outbreaks in nearby
      case 1273: // Patchy light rain with thunder
      case 1276: // Moderate or heavy rain with thunder
        return CloudLightning
      case 1168: // Freezing drizzle
      case 1171: // Heavy freezing drizzle
      case 1192: // Heavy rain at times
      case 1195: // Heavy rain
      case 1201: // Moderate or heavy sleet
      case 1204: // Light sleet showers
      case 1207: // Moderate or heavy sleet showers
      case 1237: // Ice pellets
      case 1249: // Light showers of ice pellets
      case 1252: // Moderate or heavy showers of ice pellets
      case 1261: // Light snow showers
      case 1264: // Moderate or heavy snow showers
        return CloudRain // Or a more specific icon if available
      default:
        return Cloud // Default to general cloud
    }
  }

  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr)
    const timeString = date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    })
    const dateString = date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    return `${timeString}, ${dateString}`
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const today = new Date()

    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return "Today"
    }

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  // Format giờ từ chuỗi thời gian thành "XX giờ"
  const formatHour = (timeStr) => {
    const date = new Date(timeStr)
    const hour = date.getHours()
    return `${String(hour).padStart(2, "0")} giờ`
  }

  const handleCardDoubleClick = (dayData) => {
    setSelectedDayData(dayData)
    setIsModalOpen(true)
  }

  const handleCityChange = (e) => {
    if (e.key === "Enter" && e.target.value.trim() !== "") {
      fetchWeatherData(e.target.value.trim())
    }
  }

  const handleCityInputChange = (e) => {
    setCity(e.target.value)
  }

  if (loading) {
    return <div className="loading">Đang tải dữ liệu thời tiết...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="weather-app">
      <div className="weather-container">
        <div className="city-input-container">
          <label htmlFor="city-input">Your city</label>
          <input
            id="city-input"
            type="text"
            value={city}
            onChange={handleCityInputChange}
            onKeyPress={handleCityChange}
            placeholder="Enter city name and press Enter"
            className="city-input"
          />
        </div>

        <div className="weather-content">
          <div className="left-section">
            <WeatherCard weather={currentWeather} />
          </div>

          <div className="right-section">
            <TemperatureChart data={temperatureData || []} currentWeather={currentWeather} />
            <div className="forecast-container">
              {forecast?.slice(0, 3).map((day, index) => (
                <ForecastCard key={index} forecast={day} isToday={index === 0} onDoubleClick={handleCardDoubleClick} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} data={selectedDayData} />
    </div>
  )
}

export default WeatherApp
