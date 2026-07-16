import { Routes, Route } from 'react-router-dom'
import { Navbar } from './components'
import Home from './pages/Home'
import './App.css'

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/home" element={<Home/>} />
      </Routes>
    </>
  )
}

export default App
