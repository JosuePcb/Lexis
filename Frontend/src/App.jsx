// App.jsx — Componente raíz de la aplicación.
// Gestiona el enrutamiento y el classroomRefreshKey, un contador que se incrementa
// cuando el usuario crea o se une a un aula (via Navbar), forzando que Home se remonte
// y vuelva a fetchear las aulas desde la API.

import { useState, useCallback } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Navbar } from './components'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import './App.css'

function App() {
  // Contador que al cambiar fuerza el re-montaje de Home (via prop key)
  const [classroomRefreshKey, setClassroomRefreshKey] = useState(0);

  // Callback estable que incrementa el contador. Se pasa a Navbar.
  const handleClassroomChange = useCallback(() => {
    setClassroomRefreshKey((k) => k + 1);
  }, []);

  return (
    <>
      <Navbar onClassroomChange={handleClassroomChange} />
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        {/* key={classroomRefreshKey} fuerza a React a destruir y recrear Home cuando cambia */}
        <Route path="/home" element={<Home key={classroomRefreshKey} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  )
}

export default App
