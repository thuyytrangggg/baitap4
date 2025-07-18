"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { setWeatherData, setLoading, setError } from "../store/weatherSlice"
import WeatherCard from "./WeatherCard"
import TemperatureChart from "./TemperatureChart"
import ForecastCard from "./ForecastCard"
import "./WeatherApp.css"

const WeatherApp = () => {
  const [city, setCity] = useState("Hanoi")
  const [searchCity, setSearchCity] = useState("Hanoi")
  const dispatch = useDispatch()
  const { currentWeather, forecast, temperatureData, loading, error } = useSelector((state) => state.weather)

  useEffect(() => {
    fetchWeatherData(searchCity)
  }, [])

  const fetchWeatherData = async (cityName) => {
    dispatch(setLoading(true))
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=f5ac4be4a19c47d8a3e42522222112&q=${cityName}&days=4&aqi=no&alerts=yes`,
      )

      if (!response.ok) {
        throw new Error("City not found.")
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
        temp: {
          min: Math.round(day.day.mintemp_f),
          max: Math.round(day.day.maxtemp_f),
          current: Math.round((day.day.mintemp_f + day.day.maxtemp_f) / 2),
        },
      }))

      const hourlyData = data.forecast.forecastday[0].hour
      const filteredHours = [0, 6, 12, 18, 23].map((hour) => {
        const hourData = hourlyData.find((h) => new Date(h.time).getHours() === hour) || hourlyData[0]
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

  const getWeatherIcon = (code) => {
    if (code >= 1000 && code < 1003) return "☀️" 
    if (code >= 1003 && code < 1030) return "☁️" 
    if (code >= 1030 && code < 1063) return "🌫️" 
    if (code >= 1063 && code < 1087) return "🌧️" 
    if (code >= 1087 && code < 1114) return "⛈️" 
    if (code >= 1114 && code < 1200) return "❄️" 
    if (code >= 1200 && code < 1300) return "🌨️" 
    return "☁️"
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

  const formatHour = (timeStr) => {
    const date = new Date(timeStr)
    return date.toLocaleString("en-US", { hour: "numeric", hour12: true })
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
    return <div className="loading">Loading...</div>
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
            placeholder="Enter city name"
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
              {/* Chỉ render 3 thẻ dự báo đầu tiên */}
              {forecast?.slice(0, 3).map((day, index) => (
                <ForecastCard key={index} forecast={day} isToday={index === 0} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WeatherApp
