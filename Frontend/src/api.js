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

  // ── Aulas ────────────────────────────────────────────────────────────────

  // Obtiene la lista de alumnos inscritos en un aula
  getStudents: async (classroomId) => {
    const res = await fetch(`${API_URL}/classrooms/${classroomId}/students`, {
      method: "GET",
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Error al obtener alumnos");
    return data;
  },

  // Expulsa a un alumno de un aula
  kickStudent: async (classroomId, studentId) => {
    const res = await fetch(`${API_URL}/classrooms/${classroomId}/students/${studentId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Error al expulsar alumno");
    return data;
  },

  // ── Muro / Anuncios ───────────────────────────────────────────────────────

  // Publica un anuncio en el muro de un aula
  createAnnouncement: async (courseId, content) => {
    const res = await fetch(`${API_URL}/posts`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ courseId, content }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Error al publicar anuncio");
    return data;
  },

  // Obtiene el feed de anuncios de un aula (orden cronológico inverso desde el backend)
  getWall: async (classroomId) => {
    const res = await fetch(`${API_URL}/posts/classroom/${classroomId}`, {
      method: "GET",
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Error al obtener el muro");
    return data;
  },

  // ── Comentarios ───────────────────────────────────────────────────────────

  // Agrega un comentario a un anuncio existente
  addComment: async (announcementId, content) => {
    const res = await fetch(`${API_URL}/posts/${announcementId}/comments`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Error al agregar comentario");
    return data;
  },
};
