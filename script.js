import { Chart } from "@/components/ui/chart"
// WeatherAPI configuration
const WEATHER_API_KEY = "f5ac4be4a19c47d8a3e42522222112"
const WEATHER_API_BASE = "https://api.weatherapi.com/v1"

// Global variables
let currentWeatherData = null
let currentChartType = "temp"
let weatherChart = null
const lucide = window.lucide // Declare the lucide variable

// Utility functions
function getCurrentDateTime(timezone) {
  const now = new Date()
  const options = {
    hour: "numeric",
    minute: "2-digit",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour12: true,
    timeZone: timezone,
  }
  return now.toLocaleString("en-US", options)
}

function getWeatherIcon(condition, isDay = true) {
  const conditionLower = condition.toLowerCase()

  if (conditionLower.includes("sunny") || conditionLower.includes("clear")) {
    return isDay ? "sun" : "moon"
  } else if (conditionLower.includes("partly cloudy") || conditionLower.includes("partly")) {
    return "cloud"
  } else if (conditionLower.includes("cloudy") || conditionLower.includes("overcast")) {
    return "cloud"
  } else if (conditionLower.includes("rain") || conditionLower.includes("drizzle")) {
    return "cloud-rain"
  } else if (conditionLower.includes("snow") || conditionLower.includes("blizzard")) {
    return "cloud-snow"
  } else if (conditionLower.includes("thunder") || conditionLower.includes("storm")) {
    return "cloud-lightning"
  } else if (conditionLower.includes("fog") || conditionLower.includes("mist")) {
    return "cloud-fog"
  }

  return "cloud"
}

function getIconClass(condition, isDay = true) {
  const conditionLower = condition.toLowerCase()

  if (conditionLower.includes("sunny") || conditionLower.includes("clear")) {
    return "icon-sunny"
  } else if (conditionLower.includes("rain")) {
    return "icon-rainy"
  } else if (conditionLower.includes("snow")) {
    return "icon-snow"
  } else {
    return "icon-cloudy"
  }
}

// API functions
async function fetchWeatherData(city) {
  try {
    const response = await fetch(
      `${WEATHER_API_BASE}/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(city)}&days=10&aqi=no&alerts=yes`,
    )

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }

    const data = await response.json()
    return transformWeatherData(data)
  } catch (error) {
    console.error("Error fetching weather data:", error)
    throw error
  }
}

function transformWeatherData(apiData) {
  const current = apiData.current
  const location = apiData.location
  const forecast = apiData.forecast.forecastday

  // Get hourly data for today
  const todayHourly = forecast[0].hour
  const currentHour = new Date().getHours()

  // Get next 8 hours of data
  const hourlyData = []
  for (let i = 0; i < 8; i++) {
    const hourIndex = (currentHour + i) % 24
    const hourData = todayHourly[hourIndex]
    const time = new Date(hourData.time)

    hourlyData.push({
      time: time.toLocaleTimeString("en-US", { hour: "numeric", hour12: true }),
      temp: Math.round(hourData.temp_c),
      humidity: hourData.humidity,
      uv: hourData.uv,
    })
  }

  return {
    current: {
      city: location.name,
      country: location.country,
      temperature: Math.round(current.temp_c),
      condition: current.condition.text,
      humidity: current.humidity,
      windSpeed: current.wind_kph,
      uvIndex: current.uv,
      feelsLike: Math.round(current.feelslike_c),
      visibility: current.vis_km,
      isDay: current.is_day === 1,
      lastUpdated: current.last_updated,
    },
    hourlyData: hourlyData,
    forecast: forecast.map((day, index) => {
      const date = new Date(day.date)
      const dayName =
        index === 0
          ? "Today"
          : index === 1
            ? "Tomorrow"
            : date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })

      return {
        date: dayName,
        icon: day.day.condition.text,
        condition: day.day.condition.text,
        maxTemp: Math.round(day.day.maxtemp_c),
        minTemp: Math.round(day.day.mintemp_c),
        humidity: `${day.day.avghumidity}%`,
        chanceOfRain: `${day.day.daily_chance_of_rain}%`,
      }
    }),
  }
}

// Chart functions
function initChart() {
  const ctx = document.getElementById("weatherChart").getContext("2d")

  weatherChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          data: [],
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderWidth: 3,
          pointBackgroundColor: "#3b82f6",
          pointBorderColor: "#3b82f6",
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.4,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            font: {
              size: 12,
            },
          },
        },
        y: {
          display: false,
        },
      },
      elements: {
        point: {
          hoverRadius: 8,
        },
      },
    },
  })
}

function updateChart() {
  if (!weatherChart || !currentWeatherData) return

  let data, color, title, value

  switch (currentChartType) {
    case "temp":
      data = currentWeatherData.hourlyData.map((d) => d.temp)
      color = "#3b82f6"
      title = "Temperature"
      value = `${currentWeatherData.current.temperature}°C`
      break
    case "humidity":
      data = currentWeatherData.hourlyData.map((d) => d.humidity)
      color = "#10b981"
      title = "Humidity"
      value = `${currentWeatherData.current.humidity}%`
      break
    case "uv":
      data = currentWeatherData.hourlyData.map((d) => d.uv)
      color = "#f59e0b"
      title = "UV Index"
      value = currentWeatherData.current.uvIndex.toString()
      break
  }

  // Update chart data
  weatherChart.data.labels = currentWeatherData.hourlyData.map((d) => d.time)
  weatherChart.data.datasets[0].data = data
  weatherChart.data.datasets[0].borderColor = color
  weatherChart.data.datasets[0].pointBackgroundColor = color
  weatherChart.data.datasets[0].pointBorderColor = color
  weatherChart.update()

  // Update chart header
  document.getElementById("chartTitle").textContent = title
  document.getElementById("chartValue").textContent = value
}

// UI update functions
function updateWeatherDisplay() {
  if (!currentWeatherData) return

  const current = currentWeatherData.current

  // Update current weather
  document.getElementById("currentTime").textContent = `Last updated: ${new Date(current.lastUpdated).toLocaleString()}`
  document.getElementById("temperature").textContent = `${current.temperature}°C`
  document.getElementById("condition").textContent = current.condition
  document.getElementById("humidity").textContent = `${current.humidity}%`
  document.getElementById("windSpeed").textContent = `${current.windSpeed} km/h`
  document.getElementById("feelsLike").textContent = `${current.feelsLike}°C`
  document.getElementById("visibility").textContent = `${current.visibility} km`

  // Update weather icon
  const weatherIcon = document.getElementById("weatherIcon")
  weatherIcon.setAttribute("data-lucide", getWeatherIcon(current.condition, current.isDay))
  weatherIcon.className = getIconClass(current.condition, current.isDay)

  // Re-initialize Lucide icons
  lucide.createIcons()
}

function updateForecast() {
  if (!currentWeatherData) return

  const forecastGrid = document.getElementById("forecastGrid")
  forecastGrid.innerHTML = ""

  currentWeatherData.forecast.forEach((day, index) => {
    const card = document.createElement("div")
    card.className = `forecast-card ${index === 0 ? "today" : ""}`

    card.innerHTML = `
            <div class="forecast-date">${day.date}</div>
            <div class="forecast-icon">
                <i data-lucide="${getWeatherIcon(day.icon)}" class="${getIconClass(day.icon)}"></i>
            </div>
            <div class="forecast-condition">${day.condition}</div>
            <div class="forecast-temps">
                <span class="forecast-high">${day.maxTemp}°</span>
                <span class="forecast-low">${day.minTemp}°</span>
            </div>
            <div class="forecast-details">
                <div>Humidity: ${day.humidity}</div>
                <div>Rain: ${day.chanceOfRain}</div>
            </div>
        `

    forecastGrid.appendChild(card)
  })

  // Re-initialize Lucide icons
  lucide.createIcons()
}

// Search functionality
async function searchCity() {
  const cityInput = document.getElementById("cityInput")
  const searchBtn = document.getElementById("searchBtn")
  const errorMessage = document.getElementById("errorMessage")
  const loadingMessage = document.getElementById("loadingMessage")

  const city = cityInput.value.trim()
  if (!city) return

  // Show loading state
  searchBtn.disabled = true
  cityInput.disabled = true
  searchBtn.textContent = "Searching..."
  loadingMessage.classList.remove("hidden")
  errorMessage.classList.add("hidden")

  try {
    currentWeatherData = await fetchWeatherData(city)
    updateWeatherDisplay()
    updateChart()
    updateForecast()
    errorMessage.classList.add("hidden")
  } catch (error) {
    let errorText = `Unable to find weather data for "${city}". `
    if (error.message.includes("400")) {
      errorText += "Please check the city name and try again."
    } else if (error.message.includes("401")) {
      errorText += "API key error. Please contact support."
    } else if (error.message.includes("403")) {
      errorText += "API access denied. Please contact support."
    } else {
      errorText += "Please check your internet connection and try again."
    }

    errorMessage.textContent = errorText
    errorMessage.classList.remove("hidden")
  }

  // Reset loading state
  searchBtn.disabled = false
  cityInput.disabled = false
  searchBtn.textContent = "Search"
  loadingMessage.classList.add("hidden")
}

// Event listeners
document.addEventListener("DOMContentLoaded", async () => {
  // Initialize the chart
  initChart()

  // Load default city (Hanoi)
  await searchCity()

  // Search functionality
  document.getElementById("searchBtn").addEventListener("click", searchCity)
  document.getElementById("cityInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      searchCity()
    }
  })

  // Chart type buttons
  document.querySelectorAll(".chart-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      // Remove active class from all buttons
      document.querySelectorAll(".chart-btn").forEach((b) => b.classList.remove("active"))

      // Add active class to clicked button
      this.classList.add("active")

      // Update chart type
      currentChartType = this.dataset.type
      updateChart()
    })
  })

  // Initialize Lucide icons
  lucide.createIcons()
})
