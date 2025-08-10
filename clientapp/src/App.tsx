import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Test from './pages/Test'
import IrisUI from './pages/IrisUI'
import IrisUICV from './pages/IrisUICV'
import OpenSeadragonDemo from './pages/OpenSeaDragon'
import IrisUICVBackend from './pages/IrisUICV-backend-compatable'
import IrisUICVReal from './pages/IrisUICV-backend-not-mocked'
import IrisUICVWithCamera from './pages/IrisUICV-with-camera'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<Test />} />
        <Route path="/iris" element={<IrisUI />} />
        <Route path="/iris-cv" element={<IrisUICV />} />
        <Route path="/open-sea-dragon" element={<OpenSeadragonDemo />} />
        <Route path="/iris-cv-backend" element={<IrisUICVBackend />} />
        <Route path="/iris-cv-real" element={<IrisUICVReal />} />
        <Route path="/iris-cv-industrial" element={<IrisUICVWithCamera />} />
      </Routes>
    </Router>
  )
}

export default App
