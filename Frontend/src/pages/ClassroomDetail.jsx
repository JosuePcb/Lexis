// ClassroomDetail.jsx — Página de detalle de un aula virtual.
// Contiene tres tabs: "Muro", "Tareas" y "Personas".
// El rol del usuario (teacher/student) controla qué acciones se muestran.

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import CreateTaskModal from '../components/TaskModal/CreateTaskModal';
import StudentTaskModal from '../components/TaskModal/StudentTaskModal';
import TeacherGradingModal from '../components/TaskModal/TeacherGradingModal';
import './ClassroomDetail.css';

// ── Helper: fecha relativa ────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Ahora mismo';
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  return date.toLocaleDateString('es', { day: 'numeric', month: 'short' });
};

// ── Helper: fecha límite formateada ──────────────────────────────────────────
const formatDueDate = (dateStr) => {
  if (!dateStr) return 'Sin fecha límite';
  const d = new Date(dateStr);
  return d.toLocaleString('es', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ── Componente principal ──────────────────────────────────────────────────────
const ClassroomDetail = () => {
  const { id } = useParams();                    // id del aula desde la URL
  const { user } = useAuth();                    // { id, name, role, ... }
  const navigate = useNavigate();
  const location = useLocation();

  // Estado de navegación por tabs
  const [activeTab, setActiveTab] = useState('muro'); // 'muro' | 'tareas' | 'personas'

  // Estado de datos
  const [classroom, setClassroom] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]);

  // Estado de UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Estados para Modals de Tareas
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [selectedStudentTask, setSelectedStudentTask] = useState(null);
  const [selectedGradingTask, setSelectedGradingTask] = useState(null);

  // Ref para el textarea del formulario de anuncio
  const announceTextRef = useRef(null);

  // Nombre del aula desde metadata o router state o fallback
  const classroomName = classroom?.name || location.state?.name || 'Aula';

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      api.getClassroomDetail(id).catch(() => null),
      api.getWall(id),
      api.getStudents(id),
      api.getTasksByCourse(id).catch(() => []),
    ])
      .then(([classDetail, wall, studentList, taskList]) => {
        if (!isMounted) return;
        if (classDetail) setClassroom(classDetail);
        setAnnouncements(wall);
        setStudents(studentList);
        setTasks(taskList);
        setError('');
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Error al cargar información del aula');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const refreshTasks = async () => {
    try {
      const taskList = await api.getTasksByCourse(id);
      setTasks(taskList);
    } catch (err) {
      console.error('Error refreshing tasks:', err);
    }
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  // Copia el código de la clase al portapapeles con feedback
  const handleCopyCode = () => {
    if (!classroom?.courseCode) return;
    navigator.clipboard.writeText(classroom.courseCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Publica un nuevo anuncio y lo antepone al feed
  const handlePublish = async (e) => {
    e.preventDefault();
    const content = announceTextRef.current?.value?.trim();
    if (!content) return;

    try {
      const newAnn = await api.createAnnouncement(id, content);
      setAnnouncements((prev) => [newAnn, ...prev]);
      announceTextRef.current.value = '';
    } catch (err) {
      alert(`Error al publicar: ${err.message}`);
    }
  };

  // Expulsa a un alumno previa confirmación
  const handleKick = async (studentId) => {
    const confirmed = window.confirm('¿Estás seguro de que deseas expulsar a este alumno?');
    if (!confirmed) return;

    try {
      await api.kickStudent(id, studentId);
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
    } catch (err) {
      alert(`Error al expulsar: ${err.message}`);
    }
  };

  // Envía un comentario a un anuncio
  const handleCommentSubmit = async (e, announcementId) => {
    e.preventDefault();
    const input = e.currentTarget.querySelector('input');
    const content = input?.value?.trim();
    if (!content) return;

    try {
      const newComment = await api.addComment(announcementId, content);
      setAnnouncements((prev) =>
        prev.map((ann) =>
          ann.id === announcementId
            ? { ...ann, comments: [...(ann.comments || []), newComment] }
            : ann
        )
      );
      input.value = '';
    } catch (err) {
      alert(`Error al comentar: ${err.message}`);
    }
  };

  // Elimina una tarea (solo docente)
  const handleDeleteTask = async (taskId) => {
    const confirmed = window.confirm('¿Estás seguro de que deseas eliminar esta tarea y todas sus entregas?');
    if (!confirmed) return;

    try {
      await api.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      alert(`Error al eliminar tarea: ${err.message}`);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="classroom-detail">
      {/* Cabecera: botón volver + nombre del aula + Badge de Código */}
      <header className="classroom-header">
        <button
          className="classroom-back-btn"
          onClick={() => navigate('/home')}
          aria-label="Volver a inicio"
        >
          ← Volver
        </button>

        <div className="classroom-header-title-group">
          <h1 className="classroom-title">{classroomName}</h1>
          {classroom?.section && (
            <span className="classroom-subtitle">Sección: {classroom.section}</span>
          )}
        </div>

        {/* Badge de Código de Clase con 1-Click Clipboard Copy */}
        {classroom?.courseCode && (
          <div className="course-code-badge">
            <span className="course-code-badge__label">Código:</span>
            <span className="course-code-badge__value">{classroom.courseCode}</span>
            <button
              className={`code-copy-btn ${copied ? 'code-copy-btn--copied' : ''}`}
              onClick={handleCopyCode}
              title="Copiar código al portapapeles"
            >
              {copied ? '✓ ¡Copiado!' : '📋 Copiar'}
            </button>
          </div>
        )}
      </header>

      {/* Estados de carga y error */}
      {loading && <p className="classroom-message">Cargando aula...</p>}
      {!loading && error && <p className="classroom-message classroom-message--error">{error}</p>}

      {/* Contenido principal */}
      {!loading && !error && (
        <>
          {/* Barra de 3 tabs */}
          <nav className="tabs" aria-label="Tabs del aula">
            <button
              className={`tab-btn${activeTab === 'muro' ? ' tab-btn--active' : ''}`}
              onClick={() => setActiveTab('muro')}
            >
              Muro
            </button>
            <button
              className={`tab-btn${activeTab === 'tareas' ? ' tab-btn--active' : ''}`}
              onClick={() => setActiveTab('tareas')}
            >
              Tareas ({tasks.length})
            </button>
            <button
              className={`tab-btn${activeTab === 'personas' ? ' tab-btn--active' : ''}`}
              onClick={() => setActiveTab('personas')}
            >
              Personas
            </button>
          </nav>

          {/* ── TAB: MURO ── */}
          {activeTab === 'muro' && (
            <div className="wall">
              {/* Formulario de publicación — solo docente */}
              {user?.role === 'teacher' && (
                <form className="announcement-form" onSubmit={handlePublish}>
                  <textarea
                    ref={announceTextRef}
                    className="announcement-form__textarea"
                    placeholder="Escribe un anuncio para tus alumnos..."
                    rows={4}
                  />
                  <div className="announcement-form__footer">
                    <button type="submit" className="announcement-form__btn">
                      Publicar
                    </button>
                  </div>
                </form>
              )}

              {/* Estado vacío del muro */}
              {announcements.length === 0 && (
                <p className="classroom-message">Aún no hay anuncios en este aula.</p>
              )}

              {/* Feed de anuncios */}
              {announcements.map((ann) => (
                <article key={ann.id} className="announcement-card">
                  <div className="announcement-header">
                    <span className="announcement-author">
                      {ann.publisher?.name || 'Docente'}
                    </span>
                    <span className="announcement-date">
                      {formatDate(ann.createdAt)}
                    </span>
                  </div>

                  <p className="announcement-content">{ann.content}</p>

                  <div className="comments-section">
                    {ann.comments?.map((c) => (
                      <div key={c.id} className="comment">
                        <strong className="comment__author">{c.user?.name || 'Alumno'}</strong>
                        <span className="comment__text">{c.content}</span>
                      </div>
                    ))}

                    <form
                      className="comment-form"
                      onSubmit={(e) => handleCommentSubmit(e, ann.id)}
                    >
                      <input
                        className="comment-form__input"
                        placeholder="Agrega un comentario..."
                      />
                      <button type="submit" className="comment-form__btn">
                        Comentar
                      </button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* ── TAB: TAREAS ── */}
          {activeTab === 'tareas' && (
            <div className="tasks-panel">
              {/* Cabecera del tab Tareas: Botón crear tarea (Docente) */}
              {user?.role === 'teacher' && (
                <div className="tasks-header">
                  <button
                    className="create-task-btn"
                    onClick={() => {
                      setTaskToEdit(null);
                      setIsCreateTaskOpen(true);
                    }}
                  >
                    + Crear Tarea
                  </button>
                </div>
              )}

              {/* Lista de tareas */}
              {tasks.length === 0 ? (
                <p className="classroom-message">Aún no hay tareas creadas en este aula.</p>
              ) : (
                <div className="tasks-list">
                  {tasks.map((task) => (
                    <article key={task.id} className="task-card">
                      <div className="task-card__header">
                        <div className="task-card__title-group">
                          <h3 className="task-card__title">{task.title}</h3>
                          <span className="task-card__due">
                            Vence: {formatDueDate(task.dueDate)}
                          </span>
                        </div>

                        {/* Status badge para estudiante */}
                        {user?.role === 'student' && (
                          <div className="task-card__status">
                            {task.status === 'pending' && (
                              <span className="status-badge status-badge--pending">Pendiente</span>
                            )}
                            {task.status === 'submitted' && (
                              <span className="status-badge status-badge--submitted">Entregado</span>
                            )}
                            {task.status === 'late' && (
                              <span className="status-badge status-badge--late">Entregado con retraso</span>
                            )}
                            {task.status === 'graded' && (
                              <span className="status-badge status-badge--graded">
                                Calificado: {task.score}/{task.maxScore}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Indicador de puntaje máximo para docente */}
                        {user?.role === 'teacher' && (
                          <span className="task-card__score-badge">
                            Puntos: {task.maxScore}
                          </span>
                        )}
                      </div>

                      {/* Instrucciones snippet */}
                      {(task.instructions || task.description) && (
                        <p className="task-card__description">
                          {task.instructions || task.description}
                        </p>
                      )}

                      {/* Footer y Acciones de la tarjeta */}
                      <div className="task-card__footer">
                        <span className="task-card__meta">
                          {task.attachments && task.attachments.length > 0
                            ? `📎 ${task.attachments.length} archivo/enlace(s)`
                            : 'Sin adjuntos'}
                        </span>

                        <div className="task-card__actions">
                          {user?.role === 'teacher' ? (
                            <>
                              <button
                                className="task-card__btn task-card__btn--grading"
                                onClick={() => setSelectedGradingTask(task)}
                              >
                                Ver entregas
                              </button>
                              <button
                                className="task-card__btn task-card__btn--edit"
                                onClick={() => {
                                  setTaskToEdit(task);
                                  setIsCreateTaskOpen(true);
                                }}
                              >
                                Editar
                              </button>
                              <button
                                className="task-card__btn task-card__btn--delete"
                                onClick={() => handleDeleteTask(task.id)}
                              >
                                Eliminar
                              </button>
                            </>
                          ) : (
                            <button
                              className="task-card__btn task-card__btn--view"
                              onClick={() => setSelectedStudentTask(task)}
                            >
                              Ver tarea
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: PERSONAS ── */}
          {activeTab === 'personas' && (
            <div className="students-panel">
              <h3 className="students-panel__title">
                {students.length} alumno{students.length !== 1 ? 's' : ''} inscrito{students.length !== 1 ? 's' : ''}
              </h3>

              {students.length === 0 && (
                <p className="classroom-message">No hay alumnos inscritos en este aula.</p>
              )}

              {students.map((student) => (
                <div key={student.id} className="student-row">
                  <div className="student-info">
                    <p className="student-name">{student.name}</p>
                    <p className="student-email">{student.email}</p>
                  </div>

                  {user?.role === 'teacher' && (
                    <button
                      className="kick-btn"
                      onClick={() => handleKick(student.id)}
                    >
                      Expulsar
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── MODALS ── */}
      {/* Modal Crear/Editar Tarea (Docente) */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => {
          setIsCreateTaskOpen(false);
          setTaskToEdit(null);
        }}
        onSuccess={refreshTasks}
        courseId={id}
        taskToEdit={taskToEdit}
      />

      {/* Modal Ver/Entregar Tarea (Estudiante) */}
      <StudentTaskModal
        isOpen={!!selectedStudentTask}
        onClose={() => setSelectedStudentTask(null)}
        task={selectedStudentTask}
        onSuccess={refreshTasks}
      />

      {/* Modal Revisar/Calificar Entregas (Docente) */}
      <TeacherGradingModal
        isOpen={!!selectedGradingTask}
        onClose={() => setSelectedGradingTask(null)}
        task={selectedGradingTask}
      />
    </div>
  );
};

export default ClassroomDetail;
