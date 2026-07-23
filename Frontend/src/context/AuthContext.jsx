import React, { createContext, useState, useEffect, useContext } from "react";

// Crear el contexto con valor inicial null
// El contexto es un "contenedor global" que permite compartir datos
// sin pasar props manualmente por cada nivel del árbol de componentes
const AuthContext = createContext(null);

/**
 * AuthProvider - Componente que envuelve la app y provee el estado de autenticación.
 *
 * Flujo general:
 *  1. Al montarse, revisa localStorage por si ya hay una sesión guardada (recarga de página).
 *  2. Cuando el usuario hace login, guarda token + datos del usuario en estado Y en localStorage.
 *  3. Cuando hace logout, limpia todo.
 *  4. Expone valores a cualquier componente hijo que use el hook useAuth().
 */
export const AuthProvider = ({ children }) => {
  // Estado global de autenticación
  const [user, setUser] = useState(null);       // Datos del usuario (id, name, email, role, etc.)
  const [token, setToken] = useState(null);      // JWT del usuario
  const [loading, setLoading] = useState(true);  // true mientras se verifica si hay sesión activa

  // Se ejecuta una sola vez al montar el componente
  // Su objetivo: restaurar la sesión si el usuario recargó la página
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    // Solo restaurar si ambos existen en localStorage
    if (storedToken && storedUser) {
      setToken(storedToken);
      // localStorage almacena strings, por eso se parsea el JSON
      setUser(JSON.parse(storedUser));
    }
    // Marcar como "no cargando" para permitir renderizar la app
    setLoading(false);
  }, []);

  /**
   * login - Guarda la sesión del usuario tanto en memoria (estado) como en disco (localStorage).
   * Se llama después de un POST exitoso al endpoint de login del backend.
   */
  const login = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    // Persistir en localStorage para que la sesión sobreviva a recargas de página
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  /**
   * logout - Limpia completamente la sesión del usuario.
   * Se llama al cerrar sesión o cuando el token expira.
   */
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // Helpers para verificar el rol del usuario en componentes
  // Se usan como: if (isTeacher()) { ... }
  const isTeacher = () => user?.role === "teacher";
  const isStudent = () => user?.role === "student";

  // Objeto con todos los valores y funciones que se proveen a la app
  // Cualquier componente que use useAuth() recibirá estos datos
  const value = {
    user,            // Objeto con los datos del usuario o null
    token,           // JWT string o null
    loading,         // true mientras se restaura la sesión (evita parpadeos)
    login,           // Función para iniciar sesión
    logout,          // Función para cerrar sesión
    updateUser,      // Función para actualizar datos del usuario en sesión
    isTeacher,       // Helper: retorna true si el rol es "teacher"
    isStudent,       // Helper: retorna true si el rol es "student"
    isAuthenticated: !!token, // !! convierte a boolean: true si hay token, false si no
  };

  return (
    // Provider que distribuye el contexto a todos los hijos
    <AuthContext.Provider value={value}>
      {/* No renderizar children hasta que se verifique la sesión en localStorage.
          Esto evita que se muestre la app "sin usuario" y luego parpadee al restaurar. */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth - Hook personalizado para consumir el AuthContext de forma segura.
 * Lanza error si se usa fuera de un <AuthProvider>, lo cual facilita
 * detectar problemas de configuración durante el desarrollo.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser utilizado dentro de un AuthProvider");
  }
  return context;
};
