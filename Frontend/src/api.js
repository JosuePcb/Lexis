// api.js — Cliente HTTP centralizado para comunicarse con el backend
// Reemplaza fetch() suelto en cada componente. Adjunta automáticamente el JWT y maneja errores.

const API_URL = "http://localhost:3000/api";

// Construye los headers incluyendo el token JWT si el usuario tiene sesión activa
const getHeaders = () => {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

export const api = {
  // Realiza un GET a la API. Devuelve el body parseado o lanza Error si falla.
  get: async (path) => {
    const res = await fetch(`${API_URL}${path}`, {
      method: "GET",
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Error en la solicitud");
    return data;
  },

  // Realiza un POST con body JSON a la API.
  post: async (path, body) => {
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Error en la solicitud");
    return data;
  },

  // Realiza un PUT con body JSON a la API.
  put: async (path, body) => {
    const res = await fetch(`${API_URL}${path}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Error en la solicitud");
    return data;
  },

  // Realiza un DELETE a la API.
  delete: async (path) => {
    const res = await fetch(`${API_URL}${path}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Error en la solicitud");
    return data;
  },
};
