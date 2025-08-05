import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Test from './pages/Test'
import IrisUI from './pages/IrisUI'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<Test />} />
        <Route path="/iris" element={<IrisUI />} />
      </Routes>
    </Router>
  )
}

export default App
