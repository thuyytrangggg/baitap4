"use client"

import { useState } from "react"
import "./TemperatureChart.css"

const TemperatureChart = ({ data, currentWeather }) => {
  const [activeChart, setActiveChart] = useState("temp") 

  if (!data || data.length === 0) return null

  const chartConfigs = {
    temp: {
      title: "Temperature",
      color: "#4A90E2",
      unit: "°F",
      dataKey: "temp",
    },
    uv: {
      title: "UV Index",
      color: "#F59E0B",
      unit: "",
      dataKey: "uv",
    },
    humidity: {
      title: "Humidity",
      color: "#10B981",
      unit: "%",
      dataKey: "humidity",
    },
  }

  const currentConfig = chartConfigs[activeChart]
  const values = data.map((d) => d[currentConfig.dataKey])
  const maxValue = Math.max(...values)
  const minValue = Math.min(...values)
  const valueRange = maxValue - minValue || 1

  const getCurrentTimeIndex = () => {
    const currentHour = new Date().getHours()
    let closestIndex = 0
    let minDiff = 24 

    data.forEach((point, index) => {
      const timeStr = point.time.toLowerCase()
      let hour = Number.parseInt(timeStr)

      if (timeStr.includes("pm") && hour !== 12) {
        hour += 12
      } else if (timeStr.includes("am") && hour === 12) {
        hour = 0
      }

      const diff = Math.abs(currentHour - hour)
      if (diff < minDiff) {
        minDiff = diff
        closestIndex = index
      }
    })

    return closestIndex
  }

  const currentTimeIndex = getCurrentTimeIndex()

  const chartWidth = 400
  const paddingX = 0 
  const chartPoints = data.map((point, index) => {
    const x = (index / (data.length - 1)) * chartWidth + paddingX
    const y = 80 - ((point[currentConfig.dataKey] - minValue) / valueRange) * 50
    return { x, y, value: point[currentConfig.dataKey] }
  })

  const currentPointData = chartPoints[currentTimeIndex]
  const currentValue = currentPointData ? currentPointData.value : null

  const createSmoothCurve = (points) => {
    if (points.length < 2) return ""

    let path = `M ${points[0].x},${points[0].y}`

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]

      const cpx = prev.x + (curr.x - prev.x) * 0.5
      const cpy = prev.y

      path += ` Q ${cpx},${cpy} ${curr.x},${curr.y}`
    }

    return path
  }

  const smoothPath = createSmoothCurve(chartPoints)

  return (
    <div className="temperature-chart">
      <div className="chart-header">
        <div className="chart-tabs">
          <button
            className={`chart-tab ${activeChart === "temp" ? "active" : ""}`}
            onClick={() => setActiveChart("temp")}
          >
            Temperature
          </button>
          <button className={`chart-tab ${activeChart === "uv" ? "active" : ""}`} onClick={() => setActiveChart("uv")}>
            UV Index
          </button>
          <button
            className={`chart-tab ${activeChart === "humidity" ? "active" : ""}`}
            onClick={() => setActiveChart("humidity")}
          >
            Humidity
          </button>
        </div>
      </div>

      <div className="chart-container">
        {/* Giữ nguyên viewBox 0 0 400 100 */}
        <svg className="chart-svg" viewBox="0 0 400 100">
          <defs>
            <linearGradient id={`${activeChart}Gradient`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={currentConfig.color} stopOpacity="0.3" />
              <stop offset="50%" stopColor={currentConfig.color} stopOpacity="0.15" />
              <stop offset="100%" stopColor={currentConfig.color} stopOpacity="0.05" />
            </linearGradient>

            {/* Radial gradient cho current time point */}
            <radialGradient id={`${activeChart}CurrentPoint`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="white" stopOpacity="1" />
              <stop offset="70%" stopColor={currentConfig.color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={currentConfig.color} stopOpacity="1" />
            </radialGradient>
          </defs>

          {/* Gradient fill area */}
          <path
            d={`${smoothPath} L ${chartPoints[chartPoints.length - 1].x},90 L ${chartPoints[0].x},90 Z`}
            fill={`url(#${activeChart}Gradient)`}
          />

          {/* Smooth curve line */}
          <path
            d={smoothPath}
            fill="none"
            stroke={currentConfig.color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Current time point - hiển thị giá trị tương ứng của giờ đó */}
          {currentPointData && currentValue !== null && (
            <g>
              {/* Outer glow */}
              <circle cx={currentPointData.x} cy={currentPointData.y} r="8" fill={currentConfig.color} opacity="0.2" />
              {/* Main point */}
              <circle
                cx={currentPointData.x}
                cy={currentPointData.y}
                r="5"
                fill={`url(#${activeChart}CurrentPoint)`}
                stroke={currentConfig.color}
                strokeWidth="2"
              />
              {/* Inner white dot */}
              <circle cx={currentPointData.x} cy={currentPointData.y} r="2" fill="white" />

              {/* Value label above the point */}
              <text
                x={currentPointData.x}
                y={currentPointData.y - 15}
                textAnchor="middle"
                fontSize="14"
                fontWeight="600"
                fill={currentConfig.color}
                style={{ textShadow: "0 1px 2px rgba(255,255,255,0.8)" }}
              >
                {Math.round(currentValue)}
                {currentConfig.unit}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  )
}

export default TemperatureChart
