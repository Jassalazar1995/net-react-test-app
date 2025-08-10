import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import reactLogo from '../assets/react.svg'
import viteLogo from '/vite.svg'
import Component1 from '../compontents/component1'

interface WeatherForecast {
  date: string;
  temperatureC: number;
  temperatureF: number;
  summary: string;
}

const Home = () => {
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
    <div className="min-h-screen bg-[#242424] text-white flex flex-col items-center justify-center">
      <div className="max-w-5xl mx-auto p-8 text-center">
        <div className="flex justify-center items-center space-x-0 mb-8">
          <a href="https://vite.dev" target="_blank" className="block p-6 transition-all duration-300 hover:drop-shadow-[0_0_2em_#646cffaa]">
            <img src={viteLogo} className="h-24 w-24" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank" className="block p-6 transition-all duration-300 hover:drop-shadow-[0_0_2em_#61dafbaa]">
            <img src={reactLogo} className="h-24 w-24 animate-[spin_20s_linear_infinite]" alt="React logo" />
          </a>
        </div>

        <h1 className="text-[3.2em] leading-tight font-normal mb-8">
          Ion Innovations - C# + React
        </h1>

        <div className="p-8 mb-8">
          <button
            onClick={() => setCount((count) => count + 1)}
            className="rounded-lg border border-transparent px-5 py-2.5 text-base font-medium bg-[#1a1a1a] cursor-pointer transition-colors duration-200 hover:border-[#646cff] mb-4"
          >
            count is {count}
          </button>
          <p className="mb-4">
            Edit <code className="bg-gray-700 px-2 py-1 rounded text-sm">src/App.tsx</code> and save to test HMR
          </p>
          <Component1 />

          <div className="mt-6 space-x-4 flex flex-wrap justify-center gap-4">
            <Link
              to="/test"
              className="inline-block bg-[#646cff] hover:bg-[#535bf2] text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
            >
              Go to Test Page →
            </Link>
            <Link
              to="/iris"
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
            >
              IrisUI Interface →
            </Link>
            <Link
              to="/iris-cv"
              className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
            >
              🔬 IrisUI with OpenCV →
            </Link>
            <Link
              to="/open-sea-dragon"
              className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
            >
              🐉 Open Sea Dragon Example →
            </Link>
            <Link
              to="/measurement-viewer"
              className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
            >
              🐉 Measurement Viewer →
            </Link>
          </div>
        </div>

        <div className="p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Weather Forecast</h2>
          {loading ? (
            <p>Loading weather data...</p>
          ) : (
            <table className="mx-auto border-collapse">
              <thead>
                <tr>
                  <th className="border border-[#ccc] p-2">Date</th>
                  <th className="border border-[#ccc] p-2">Temp. (C)</th>
                  <th className="border border-[#ccc] p-2">Temp. (F)</th>
                  <th className="border border-[#ccc] p-2">Summary</th>
                </tr>
              </thead>
              <tbody>
                {weather.map((forecast, index) => (
                  <tr key={index}>
                    <td className="border border-[#ccc] p-2">{forecast.date}</td>
                    <td className="border border-[#ccc] p-2">{forecast.temperatureC}°C</td>
                    <td className="border border-[#ccc] p-2">{forecast.temperatureF}°F</td>
                    <td className="border border-[#ccc] p-2">{forecast.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <p className="text-[#888]">
          This React app is integrated with a C# .NET API backend!
        </p>
      </div>
    </div>
  )
}

export default Home