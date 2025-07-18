import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  currentWeather: null,
  forecast: [],
  temperatureData: [],
  loading: false,
  error: null,
}

const weatherSlice = createSlice({
  name: "weather",
  initialState,
  reducers: {
    setWeatherData: (state, action) => {
      state.currentWeather = action.payload.current
      state.forecast = action.payload.forecast
      state.temperatureData = action.payload.temperatureData
      state.error = null
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
      state.loading = false
    },
  },
})

export const { setWeatherData, setLoading, setError } = weatherSlice.actions
export default weatherSlice.reducer
