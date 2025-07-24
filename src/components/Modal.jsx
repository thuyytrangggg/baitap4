"use client"
import "./Modal.css"

export default function Modal({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null

  // Helper to render Lucide React components
  const renderIcon = (IconComponent, size = 24) => {
    if (typeof IconComponent === "string") {
      // Fallback for emojis if any are still passed
      return <span style={{ fontSize: `${size}px` }}>{IconComponent}</span>
    }
    const Icon = IconComponent
    return <Icon size={size} />
  }

  // Chart logic for hourly data
  const hourlyTemps = data.hourly?.map((h) => h.temp_f) || []

  // Fixed Y-axis range as per user request
  const fixedMinTemp = 75
  const fixedMaxTemp = 105
  const fixedTempRange = fixedMaxTemp - fixedMinTemp || 1

  // Determine Y-axis labels based on fixed range, with 5-unit intervals
  const yAxisLabels = []
  for (let t = fixedMinTemp; t <= fixedMaxTemp; t += 5) {
    yAxisLabels.push(t)
  }
  yAxisLabels.sort((a, b) => a - b) // Ensure labels are sorted

  const chartWidth = 400 // SVG viewBox width
  const chartHeight = 220 // Increased height to give more space at the bottom for labels
  const chartPaddingX = 20 // Padding on left/right for chart line
  const chartPaddingY = 20 // Padding top/bottom for points
  const chartDrawableWidth = chartWidth - chartPaddingX * 2
  const chartDrawableHeight = chartHeight - chartPaddingY * 2 - 60 // Adjusted for bottom labels/icons and more space

  const chartPoints =
    data.hourly?.map((h, index) => {
      const x = chartPaddingX + (index / (data.hourly.length - 1)) * chartDrawableWidth
      // Use fixedMinTemp and fixedTempRange for Y-coordinate calculation
      const y = chartPaddingY + chartDrawableHeight - ((h.temp_f - fixedMinTemp) / fixedTempRange) * chartDrawableHeight
      return { x, y, value: h.temp_f, time: h.time, icon: h.icon, condition: h.condition.text }
    }) || []

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

  // --- Xác định điểm nhiệt độ cao nhất và thấp nhất ---
  let maxTempPoint = null
  let minTempPoint = null

  if (chartPoints.length > 0) {
    maxTempPoint = chartPoints[0]
    minTempPoint = chartPoints[0]

    for (let i = 1; i < chartPoints.length; i++) {
      if (chartPoints[i].value > maxTempPoint.value) {
        maxTempPoint = chartPoints[i]
      }
      if (chartPoints[i].value < minTempPoint.value) {
        minTempPoint = chartPoints[i]
      }
    }
  }
  // ----------------------------------------------------

  // Filter hourly data for X-axis labels (every 6 hours) and vertical grid lines
  const xGridAndLabelHours = [0, 6, 12, 18]
  // We need the actual chartPoints for these hours to get their x-coordinates
  const majorHourChartPoints = xGridAndLabelHours
    .map((hour) => {
      const hourData = data.hourly?.find((h) => new Date(h.time).getHours() === hour)
      if (hourData) {
        const index = data.hourly.indexOf(hourData)
        return chartPoints[index]
      }
      return null
    })
    .filter(Boolean) // Remove any nulls if an hour is not found

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* No close button as per image */}

        {/* Top section: Current Temp, C: T: */}
        <div className="modal-header-summary">
          <div className="modal-current-temp">{Math.round(data.hourly[0]?.temp_f || 0)}°F</div>
          <div className="modal-condition-text">{data.hourly[0]?.condition.text || "N/A"}</div>
          <div className="modal-min-max-temp">
            C:{data.maxTemp}°F T:{data.minTemp}°F
          </div>
        </div>

        <div className="modal-chart-container">
          {hourlyTemps.length > 0 ? (
            <svg className="modal-chart-svg" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
              <defs>
                <linearGradient id="modalTempGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#479fd5ff" stopOpacity="0.5" /> {/* Yellowish gradient */}
                  <stop offset="100%" stopColor="#237cc4ff" stopOpacity="0.1" /> {/* Orangeish gradient */}
                </linearGradient>
              </defs>

              {/* Horizontal Grid Lines */}
              {yAxisLabels.map((temp, index) => {
                const y =
                  chartPaddingY + chartDrawableHeight - ((temp - fixedMinTemp) / fixedTempRange) * chartDrawableHeight
                return (
                  <line
                    key={`h-grid-${index}`}
                    x1={chartPaddingX}
                    y1={y}
                    x2={chartWidth - chartPaddingX}
                    y2={y}
                    stroke="#555" /* Màu mờ hơn một chút */
                    strokeWidth="0.5" /* Mảnh hơn */
                  />
                )
              })}

              {/* Vertical Dashed Grid Lines & X-axis labels & Icons */}
              {/* Render vertical dashed lines only for major hours */}
              {majorHourChartPoints.map((point, index) => (
                <g key={`major-hour-grid-${index}`}>
                  <line
                    x1={point.x}
                    y1={chartPaddingY}
                    x2={point.x}
                    y2={chartHeight - 60}
                    stroke="#888" /* Sáng hơn */
                    strokeWidth="1" /* Dày hơn */
                    strokeDasharray="2 2"
                  />
                </g>
              ))}

              {/* Icons above chart - Render only 12 icons (every other hour) */}
              {chartPoints.map(
                (point, index) =>
                  index % 2 === 0 && (
                    <foreignObject key={`icon-${index}`} x={point.x - 5} y={-15} width="24" height="35">
                      {" "}
                      {/* Adjusted y to -15 */}
                      <div className="modal-chart-icon-wrapper">{renderIcon(point.icon, 19)}</div>
                    </foreignObject>
                  ),
              )}

              {/* Time labels below chart - Render only for major hours */}
              {majorHourChartPoints.map((point, index) => (
                <text
                  key={`time-label-${index}`}
                  x={point.x}
                  y={chartHeight - 25}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#AAA"
                >
                  {point.time}
                </text>
              ))}

              {/* Gradient fill area */}
              <path
                d={`${smoothPath} L ${chartPoints[chartPoints.length - 1].x},${chartHeight - 60} L ${
                  chartPoints[0].x
                },${chartHeight - 60} Z`}
                fill="url(#modalTempGradient)"
              />

              {/* Smooth curve line */}
              <path
                d={smoothPath}
                fill="none"
                stroke="#3474bdff" // Orange line color
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points and temperature labels for MIN and MAX only */}
              {maxTempPoint && (
                <g>
                  {/* Circle for the data point */}
                  <circle
                    cx={maxTempPoint.x}
                    cy={maxTempPoint.y}
                    r="3"
                    fill="white"
                    stroke="#3370c0ff"
                    strokeWidth="1.5"
                  />

                  {/* Temperature label above the point */}
                  <text
                    x={maxTempPoint.x}
                    y={maxTempPoint.y - 8}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="600"
                    fill="gray"
                  >
                    {Math.round(maxTempPoint.value)}°F
                  </text>
                </g>
              )}
              {minTempPoint &&
                minTempPoint !== maxTempPoint && ( // Ensure not to draw twice if min and max are the same point
                  <g>
                    {/* Circle for the data point */}
                    <circle
                      cx={minTempPoint.x}
                      cy={minTempPoint.y}
                      r="3"
                      fill="white"
                      stroke="#3370c0ff"
                      strokeWidth="1.5"
                    />

                    {/* Temperature label above the point */}
                    <text
                      x={minTempPoint.x}
                      y={minTempPoint.y - 8}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="600"
                      fill="gray"
                    >
                      {Math.round(minTempPoint.value)}°F
                    </text>
                  </g>
                )}

              {/* Y-axis labels (Temperatures) */}
              {yAxisLabels.map((temp, index) => {
                // Calculate Y position based on fixed range
                const y =
                  chartPaddingY + chartDrawableHeight - ((temp - fixedMinTemp) / fixedTempRange) * chartDrawableHeight
                return (
                  <text
                    key={`y-label-${index}`}
                    x={chartWidth + 4} // Position on the right edge
                    y={y + 4} // Adjust for vertical centering
                    textAnchor="end"
                    fontSize="10"
                    fill="gray"
                  >
                    {temp}°F
                  </text>
                )
              })}
            </svg>
          ) : (
            <p className="no-chart-data">No hourly temperature data available for chart.</p>
          )}
        </div>
      </div>
    </div>
  )
}
