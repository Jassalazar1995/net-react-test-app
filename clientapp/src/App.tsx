import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Test from './pages/Test'
import IrisUI from './pages/IrisUI'
import IrisUICV from './pages/IrisUICV'
import OpenSeadragonDemo from './pages/OpenSeaDragon'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<Test />} />
        <Route path="/iris" element={<IrisUI />} />
        <Route path="/iris-cv" element={<IrisUICV />} />
        <Route path="/open-sea-dragon" element={<OpenSeadragonDemo />} />
      </Routes>
    </Router>
  )
}

export default App
