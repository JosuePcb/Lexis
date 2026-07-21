// ClassroomDetail.jsx — Página de detalle de un aula virtual.
// Contiene dos tabs: "Muro" (feed de anuncios + comentarios) y "Personas" (lista de alumnos).
// El rol del usuario (teacher/student) controla qué acciones se muestran.

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import './ClassroomDetail.css';

// ── Helper: fecha relativa ────────────────────────────────────────────────────
const formatDate = (dateStr) => {
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

// ── Componente principal ──────────────────────────────────────────────────────
const ClassroomDetail = () => {
  const { id } = useParams();                    // id del aula desde la URL
  const { user } = useAuth();                    // { id, name, role, ... }
  const navigate = useNavigate();
  const location = useLocation();
  // Nombre del aula recibido como router state desde RoomCard.
  // Si el usuario navega directo por URL, usa 'Aula' como fallback.
  const classroomName = location.state?.name || 'Aula';

  // Estado de navegación por tabs
  const [activeTab, setActiveTab] = useState('muro'); // 'muro' | 'personas'

  // Estado de datos
  const [announcements, setAnnouncements] = useState([]);
  const [students, setStudents] = useState([]);

  // Estado de UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Ref para el textarea del formulario de anuncio (para limpiarlo tras publicar)
  const announceTextRef = useRef(null);

  // ── Fetch inicial ─────────────────────────────────────────────────────────

  // Carga el muro y los alumnos en paralelo al montar el componente
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [wall, studentList] = await Promise.all([
          api.getWall(id),
          api.getStudents(id),
        ]);
        setAnnouncements(wall);
        setStudents(studentList);
        setError('');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  // Publica un nuevo anuncio y lo antepone al feed (más reciente arriba)
  const handlePublish = async (e) => {
    e.preventDefault();
    const content = announceTextRef.current?.value?.trim();
    if (!content) return;

    try {
      const newAnn = await api.createAnnouncement(id, content);
      // Anteponer al feed para que aparezca arriba
      setAnnouncements((prev) => [newAnn, ...prev]);
      announceTextRef.current.value = '';
    } catch (err) {
      alert(`Error al publicar: ${err.message}`);
    }
  };

  // Expulsa a un alumno previa confirmación nativa del navegador
  const handleKick = async (studentId) => {
    const confirmed = window.confirm('¿Estás seguro de que deseas expulsar a este alumno?');
    if (!confirmed) return;

    try {
      await api.kickStudent(id, studentId);
      // Eliminar el alumno de la lista local
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
    } catch (err) {
      alert(`Error al expulsar: ${err.message}`);
    }
  };

  // Envía un comentario y lo agrega al anuncio correspondiente en el estado
  const handleCommentSubmit = async (e, announcementId) => {
    e.preventDefault();
    const input = e.currentTarget.querySelector('input');
    const content = input?.value?.trim();
    if (!content) return;

    try {
      const newComment = await api.addComment(announcementId, content);
      // Actualizar el array de comentarios del anuncio afectado
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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="classroom-detail">
      {/* Cabecera: botón volver + nombre del aula */}
      <header className="classroom-header">
        <button
          className="classroom-back-btn"
          onClick={() => navigate('/home')}
          aria-label="Volver a inicio"
        >
          ← Volver
        </button>
        <h1 className="classroom-title">{classroomName}</h1>
      </header>

      {/* Estados de carga y error */}
      {loading && <p className="classroom-message">Cargando...</p>}
      {!loading && error && <p className="classroom-message classroom-message--error">{error}</p>}

      {/* Contenido principal — se muestra solo cuando no hay carga ni error */}
      {!loading && !error && (
        <>
          {/* Barra de tabs */}
          <nav className="tabs" aria-label="Tabs del aula">
            <button
              className={`tab-btn${activeTab === 'muro' ? ' tab-btn--active' : ''}`}
              onClick={() => setActiveTab('muro')}
            >
              Muro
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
              {/* Formulario de publicación — solo visible para teachers */}
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
                  {/* Cabecera del anuncio: autor y fecha */}
                  <div className="announcement-header">
                    <span className="announcement-author">
                      {ann.publisher?.name || 'Docente'}
                    </span>
                    <span className="announcement-date">
                      {formatDate(ann.createdAt)}
                    </span>
                  </div>

                  {/* Contenido del anuncio */}
                  <p className="announcement-content">{ann.content}</p>

                  {/* Sección de comentarios — siempre visible */}
                  <div className="comments-section">
                    {ann.comments?.map((c) => (
                      <div key={c.id} className="comment">
                        <strong className="comment__author">{c.user?.name || 'Alumno'}</strong>
                        <span className="comment__text">{c.content}</span>
                      </div>
                    ))}

                    {/* Formulario para agregar comentario */}
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

          {/* ── TAB: PERSONAS ── */}
          {activeTab === 'personas' && (
            <div className="students-panel">
              <h3 className="students-panel__title">
                {students.length} alumno{students.length !== 1 ? 's' : ''} inscrito{students.length !== 1 ? 's' : ''}
              </h3>

              {/* Estado vacío */}
              {students.length === 0 && (
                <p className="classroom-message">No hay alumnos inscritos en este aula.</p>
              )}

              {/* Lista de alumnos */}
              {students.map((student) => (
                <div key={student.id} className="student-row">
                  <div className="student-info">
                    <p className="student-name">{student.name}</p>
                    <p className="student-email">{student.email}</p>
                  </div>

                  {/* Botón expulsar — solo para teachers */}
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
    </div>
  );
};

export default ClassroomDetail;
