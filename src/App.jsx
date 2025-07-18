import { Provider } from "react-redux"
import { store } from "./store/store"
import WeatherApp from "./components/WeatherApp"
import "./App.css"

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <WeatherApp />
      </div>
    </Provider>
  )
}

export default App
