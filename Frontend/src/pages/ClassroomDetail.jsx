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
  const [gradebook, setGradebook] = useState(null);

  // Estado de UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Estados para Modals de Tareas
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [selectedStudentTask, setSelectedStudentTask] = useState(null);
  const [selectedGradingTask, setSelectedGradingTask] = useState(null);

  // Estado para modal de editar aula
  const [isEditClassroomOpen, setIsEditClassroomOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', section: '', description: '' });
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

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

  const refreshGradebook = async () => {
    try {
      if (user?.role === 'teacher') {
        const data = await api.getTeacherGradebook(id);
        setGradebook(data);
      } else {
        const data = await api.getStudentGradebook(id);
        setGradebook(data);
      }
    } catch (err) {
      console.error('Error refreshing gradebook:', err);
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

  // Abrir modal de editar aula
  const handleOpenEditClassroom = () => {
    setEditForm({
      name: classroom?.name || '',
      section: classroom?.section || '',
      description: classroom?.description || '',
    });
    setEditError('');
    setIsEditClassroomOpen(true);
  };

  // Guardar cambios del aula
  const handleSaveClassroom = async () => {
    const trimmedName = editForm.name.trim();
    if (!trimmedName) {
      setEditError('El nombre del aula es obligatorio.');
      return;
    }
    if (editForm.description.length > 100) {
      setEditError('La descripción no puede superar los 100 caracteres.');
      return;
    }

    setEditLoading(true);
    setEditError('');
    try {
      const updated = await api.updateClassroom(id, {
        name: trimmedName,
        section: editForm.section.trim(),
        description: editForm.description.trim(),
      });
      setClassroom(updated);
      setIsEditClassroomOpen(false);
    } catch (err) {
      setEditError(err.message || 'Error al guardar los cambios.');
    } finally {
      setEditLoading(false);
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
          <div className="classroom-title-row">
            <h1 className="classroom-title">{classroomName}</h1>
            {user?.role === 'teacher' && (
              <button className="classroom-edit-btn" onClick={handleOpenEditClassroom}>
                Editar aula
              </button>
            )}
          </div>
          {classroom?.section && (
            <span className="classroom-subtitle">Sección: {classroom.section}</span>
          )}
          {classroom?.description && (
            <span className="classroom-description">{classroom.description}</span>
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
            <button
              className={`tab-btn${activeTab === 'calificaciones' ? ' tab-btn--active' : ''}`}
              onClick={() => {
                setActiveTab('calificaciones');
                if (!gradebook) refreshGradebook();
              }}
            >
              Calificaciones
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

          {/* ── TAB: CALIFICACIONES ── */}
          {activeTab === 'calificaciones' && (
            <div className="gradebook-panel">
              {!gradebook ? (
                <p className="classroom-message">Cargando calificaciones...</p>
              ) : user?.role === 'teacher' ? (
                /* ── Vista del Docente: Tabla centralizada ── */
                gradebook.rows.length === 0 ? (
                  <p className="classroom-message">No hay alumnos inscritos en este aula.</p>
                ) : (
                  <div className="gradebook-table-wrapper">
                    <div className="gradebook-table-header">
                      <h3 className="gradebook-panel__title">Libreta de Calificaciones</h3>
                      <button className="gradebook-refresh-btn" onClick={refreshGradebook}>
                        Actualizar
                      </button>
                    </div>
                    <div className="gradebook-table-scroll">
                      <table className="gradebook-table">
                        <thead>
                          <tr>
                            <th className="gradebook-th gradebook-th--student">Alumno</th>
                            {gradebook.assignments.map((assignment) => (
                              <th key={assignment.id} className="gradebook-th">
                                <span className="gradebook-th__title">{assignment.title}</span>
                                <span className="gradebook-th__max">/{assignment.maxScore}</span>
                              </th>
                            ))}
                            <th className="gradebook-th gradebook-th--avg">Promedio</th>
                          </tr>
                        </thead>
                        <tbody>
                          {gradebook.rows.map((row) => {
                            const totalScore = row.grades.reduce((sum, g) => sum + (g.score ?? 0), 0);
                            const totalMax = row.grades.reduce((sum, g) => sum + g.maxScore, 0);
                            const avgPercent = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
                            return (
                              <tr key={row.student.id}>
                                <td className="gradebook-td gradebook-td--student">
                                  <div className="gradebook-student-name">{row.student.name}</div>
                                  <div className="gradebook-student-email">{row.student.email}</div>
                                </td>
                                {row.grades.map((grade) => (
                                  <td key={grade.assignmentId} className="gradebook-td">
                                    <span className={`gradebook-grade ${grade.status === 'graded' ? 'gradebook-grade--graded' : grade.status === 'submitted' || grade.status === 'late' ? 'gradebook-grade--submitted' : 'gradebook-grade--pending'}`}>
                                      {grade.status === 'graded' && grade.score !== null
                                        ? grade.score
                                        : grade.status === 'submitted' || grade.status === 'late'
                                          ? '—'
                                          : '0'}
                                    </span>
                                  </td>
                                ))}
                                <td className="gradebook-td gradebook-td--avg">
                                  <span className="gradebook-avg">{avgPercent}%</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              ) : (
                /* ── Vista del Estudiante: Panel individual ── */
                <>
                  {gradebook.stats && (
                    <div className="gradebook-stats">
                      <div className="gradebook-stat-card">
                        <span className="gradebook-stat-card__value">{gradebook.stats.totalAssignments}</span>
                        <span className="gradebook-stat-card__label">Total tareas</span>
                      </div>
                      <div className="gradebook-stat-card">
                        <span className="gradebook-stat-card__value">{gradebook.stats.gradedCount}</span>
                        <span className="gradebook-stat-card__label">Calificadas</span>
                      </div>
                      <div className="gradebook-stat-card">
                        <span className="gradebook-stat-card__value">{gradebook.stats.submittedCount}</span>
                        <span className="gradebook-stat-card__label">Entregadas</span>
                      </div>
                      <div className="gradebook-stat-card">
                        <span className="gradebook-stat-card__value">{gradebook.stats.pendingCount}</span>
                        <span className="gradebook-stat-card__label">Pendientes</span>
                      </div>
                      {gradebook.stats.averagePercentage !== null && (
                        <div className="gradebook-stat-card gradebook-stat-card--highlight">
                          <span className="gradebook-stat-card__value">{gradebook.stats.averagePercentage}%</span>
                          <span className="gradebook-stat-card__label">Promedio</span>
                        </div>
                      )}
                    </div>
                  )}

                  {gradebook.history.length === 0 ? (
                    <p className="classroom-message">Aún no hay tareas en este aula.</p>
                  ) : (
                    <div className="gradebook-history">
                      <div className="gradebook-table-header">
                        <h3 className="gradebook-panel__title">Mi Historial de Calificaciones</h3>
                        <button className="gradebook-refresh-btn" onClick={refreshGradebook}>
                          Actualizar
                        </button>
                      </div>
                      {gradebook.history.map((item) => (
                        <div key={item.assignmentId} className="gradebook-history-card">
                          <div className="gradebook-history-card__header">
                            <h4 className="gradebook-history-card__title">{item.title}</h4>
                            <span className={`gradebook-history-card__badge gradebook-history-card__badge--${item.status}`}>
                              {item.status === 'graded' && `Calificado: ${item.score}/${item.maxScore}`}
                              {item.status === 'submitted' && 'Entregado'}
                              {item.status === 'late' && 'Entregado con retraso'}
                              {item.status === 'pending' && 'Pendiente'}
                            </span>
                          </div>
                          <div className="gradebook-history-card__details">
                            <span className="gradebook-history-card__detail">
                              Vence: {formatDueDate(item.dueDate)}
                            </span>
                            {item.submissionDate && (
                              <span className="gradebook-history-card__detail">
                                Entregado: {new Date(item.submissionDate).toLocaleString('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                          {item.teacherComment && (
                            <div className="gradebook-history-card__comment">
                              <span className="gradebook-history-card__comment-label">Comentario del docente:</span>
                              <span className="gradebook-history-card__comment-text">{item.teacherComment}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
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

      {/* Modal Editar Aula (Docente) */}
      {isEditClassroomOpen && (
        <div className="edit-classroom-overlay" onClick={() => setIsEditClassroomOpen(false)}>
          <div className="edit-classroom-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="edit-classroom-modal__title">Editar Aula</h3>

            <label className="edit-classroom-modal__label">
              Nombre
              <input
                className="edit-classroom-modal__input"
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Nombre del aula"
                disabled={editLoading}
              />
            </label>

            <label className="edit-classroom-modal__label">
              Sección
              <input
                className="edit-classroom-modal__input"
                type="text"
                value={editForm.section}
                onChange={(e) => setEditForm({ ...editForm, section: e.target.value })}
                placeholder="Opcional"
                disabled={editLoading}
              />
            </label>

            <label className="edit-classroom-modal__label">
              Descripción
              <textarea
                className="edit-classroom-modal__textarea"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Describe el aula (máx. 100 caracteres)"
                maxLength={100}
                rows={3}
                disabled={editLoading}
              />
              <span className="edit-classroom-modal__char-count">
                {editForm.description.length}/100
              </span>
            </label>

            {editError && (
              <p className="edit-classroom-modal__error">{editError}</p>
            )}

            <div className="edit-classroom-modal__actions">
              <button
                className="edit-classroom-modal__btn edit-classroom-modal__btn--cancel"
                onClick={() => setIsEditClassroomOpen(false)}
                disabled={editLoading}>
                Cancelar
              </button>
              <button
                className="edit-classroom-modal__btn edit-classroom-modal__btn--save"
                onClick={handleSaveClassroom}
                disabled={editLoading}>
                {editLoading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomDetail;
