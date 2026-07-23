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

// Manejo centralizado de respuestas HTTP para extraer mensajes de error legibles
const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    const errorMsg =
      data.error?.message ||
      (typeof data.error === "string" ? data.error : null) ||
      "Error en la solicitud";
    throw new Error(errorMsg);
  }
  return data;
};

export const api = {
  // Realiza un GET a la API. Devuelve el body parseado o lanza Error si falla.
  get: async (path) => {
    const res = await fetch(`${API_URL}${path}`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Realiza un POST con body JSON a la API.
  post: async (path, body) => {
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  // Realiza un PUT con body JSON a la API.
  put: async (path, body) => {
    const res = await fetch(`${API_URL}${path}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  // Realiza un DELETE a la API.
  delete: async (path) => {
    const res = await fetch(`${API_URL}${path}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // ── Aulas ────────────────────────────────────────────────────────────────

  // Obtiene el detalle de un aula por su ID
  getClassroomDetail: async (classroomId) => {
    return api.get(`/classrooms/${classroomId}`);
  },

  // Obtiene la lista de alumnos inscritos en un aula
  getStudents: async (classroomId) => {
    return api.get(`/classrooms/${classroomId}/students`);
  },

  // Expulsa a un alumno de un aula
  kickStudent: async (classroomId, studentId) => {
    return api.delete(`/classrooms/${classroomId}/students/${studentId}`);
  },

  // ── Muro / Anuncios ───────────────────────────────────────────────────────

  // Publica un anuncio en el muro de un aula
  createAnnouncement: async (courseId, content) => {
    return api.post("/posts", { courseId, content });
  },

  // Obtiene el feed de anuncios de un aula (orden cronológico inverso desde el backend)
  getWall: async (classroomId) => {
    return api.get(`/posts/classroom/${classroomId}`);
  },

  // ── Comentarios ───────────────────────────────────────────────────────────

  // Agrega un comentario a un anuncio existente
  addComment: async (announcementId, content) => {
    return api.post(`/posts/${announcementId}/comments`, { content });
  },

  // ── Tareas y Calificaciones ───────────────────────────────────────────────

  // Obtiene todas las tareas de un aula (incluye mi entrega/estado si soy alumno)
  getTasksByCourse: async (courseId) => {
    return api.get(`/tasks/course/${courseId}`);
  },

  // Obtiene el detalle de una tarea específica
  getTaskById: async (taskId) => {
    return api.get(`/tasks/${taskId}`);
  },

  // Crea una tarea (soporta FormData con archivos adjuntos y links)
  createTask: async (formData) => {
    const token = localStorage.getItem("token");
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers,
      body: formData,
    });
    return handleResponse(res);
  },

  // Actualiza los datos de una tarea (título, instrucciones, dueDate, maxScore)
  updateTask: async (taskId, taskData) => {
    return api.put(`/tasks/${taskId}`, taskData);
  },

  // Elimina una tarea
  deleteTask: async (taskId) => {
    return api.delete(`/tasks/${taskId}`);
  },

  // Entrega una tarea (soporta FormData con archivos y links)
  submitTask: async (taskId, formData) => {
    const token = localStorage.getItem("token");
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_URL}/tasks/${taskId}/submit`, {
      method: "POST",
      headers,
      body: formData,
    });
    return handleResponse(res);
  },

  // Anula la entrega de una tarea (solo si no está calificada)
  unsubmitTask: async (taskId) => {
    return api.post(`/tasks/${taskId}/unsubmit`, {});
  },

  // Obtiene la lista de entregas de los estudiantes para una tarea (docente)
  getSubmissions: async (taskId) => {
    return api.get(`/tasks/${taskId}/submissions`);
  },

  // Califica o edita la nota/comentario de la entrega de un estudiante (docente)
  gradeSubmission: async (submissionId, { score, comment }) => {
    return api.post(`/tasks/submissions/${submissionId}/grade`, { score, comment });
  },

  // ── Libreta de Calificaciones ────────────────────────────────────────────

  // Obtiene la libreta de calificaciones del docente (tabla alumnos x tareas)
  getTeacherGradebook: async (classroomId) => {
    return api.get(`/grades/classroom/${classroomId}/teacher`);
  },

  // Obtiene la libreta de calificaciones del estudiante (historial personal)
  getStudentGradebook: async (classroomId) => {
    return api.get(`/grades/classroom/${classroomId}/student`);
  },

  // ── Perfil de Usuario ────────────────────────────────────────────────────

  // Actualiza el nombre del usuario
  updateProfile: async (name) => {
    return api.put("/auth/profile", { name });
  },
};

