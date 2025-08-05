import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

interface WeatherForecast {
  date: string;
  temperatureC: number;
  temperatureF: number;
  summary: string;
}

function App() {
  const [count, setCount] = useState(0)
  const [weather, setWeather] = useState<WeatherForecast[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWeatherData()
  }, [])

  const fetchWeatherData = async () => {
    try {
      const response = await fetch('http://localhost:5241/weatherforecast')
      const data = await response.json()
      setWeather(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching weather data:', error)
      setLoading(false)
    }
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Ion Innovations - C# + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>

      <div className="card">
        <h2>Weather Forecast</h2>
        {loading ? (
          <p>Loading weather data...</p>
        ) : (
          <table style={{ margin: '0 auto', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Date</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Temp. (C)</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Temp. (F)</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Summary</th>
              </tr>
            </thead>
            <tbody>
              {weather.map((forecast, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>{forecast.date}</td>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>{forecast.temperatureC}°C</td>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>{forecast.temperatureF}°F</td>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>{forecast.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="read-the-docs">
        This React app is integrated with a C# .NET API backend!
      </p>
    </>
  )
}

export default App
