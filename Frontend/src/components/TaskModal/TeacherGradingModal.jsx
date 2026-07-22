// TeacherGradingModal.jsx — Modal de revisión y calificación de entregas para docentes
import { useState, useEffect } from 'react';
import { api } from '../../api';
import './TaskModal.css';

const formatDateTime = (dateStr) => {
  if (!dateStr) return 'Sin fecha';
  const d = new Date(dateStr);
  return d.toLocaleString('es', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getFileUrl = (url) => {
  if (!url) return '';
  return url.startsWith('/') ? `http://localhost:3000${url}` : url;
};

const TeacherGradingModal = ({ isOpen, onClose, task }) => {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSub, setSelectedSub] = useState(null);
  const [score, setScore] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [gradingLoading, setGradingLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    let isMounted = true;
    if (isOpen && task?.id) {
      api.getSubmissions(task.id)
        .then((data) => {
          if (!isMounted) return;
          setSubmissions(data);
          if (data.length > 0) {
            setSelectedSub(data[0]);
            setScore(data[0].score !== null && data[0].score !== undefined ? data[0].score : '');
            setComment(data[0].teacherComment || '');
          }
          setLoading(false);
        })
        .catch((err) => {
          if (!isMounted) return;
          setError(err.message || 'Error al cargar entregas');
          setLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, task?.id]);

  if (!isOpen || !task) return null;

  const handleSelectStudent = (sub) => {
    setSelectedSub(sub);
    setScore(sub.score !== null && sub.score !== undefined ? sub.score : '');
    setComment(sub.teacherComment || '');
    setError('');
    setSuccessMsg('');
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;

    if (!selectedSub.id) {
      setError('El alumno no ha realizado una entrega para calificar.');
      return;
    }

    const numericScore = Number(score);
    if (isNaN(numericScore)) {
      setError('La nota debe ser un número.');
      return;
    }

    if (numericScore < 0 || numericScore > task.maxScore) {
      setError(`La nota debe estar entre 0 y ${task.maxScore}`);
      return;
    }

    try {
      setGradingLoading(true);
      setError('');
      setSuccessMsg('');

      const updated = await api.gradeSubmission(selectedSub.id, {
        score: numericScore,
        comment: comment.trim(),
      });

      // Actualizar estado local
      setSubmissions((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      );
      setSelectedSub(updated);
      setSuccessMsg('¡Calificación guardada con éxito!');
    } catch (err) {
      setError(err.message || 'Error al guardar la calificación');
    } finally {
      setGradingLoading(false);
    }
  };

  return (
    <div className="task-modal-overlay" onClick={onClose}>
      <div className="task-modal task-modal--wide" onClick={(e) => e.stopPropagation()}>
        <div className="task-modal__header">
          <div>
            <h2 className="task-modal__title">Entregas: {task.title}</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-secondary)' }}>
              Puntaje máximo: {task.maxScore} pts
            </span>
          </div>
          <button className="task-modal__close-btn" onClick={onClose} aria-label="Cerrar">
            &times;
          </button>
        </div>

        {error && <div className="task-modal__error">{error}</div>}
        {successMsg && <div className="task-modal__success">{successMsg}</div>}

        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem' }}>Cargando entregas...</p>
        ) : (
          <div className="grading-split-container">
            {/* Panel Izquierdo: Lista de Estudiantes */}
            <div className="students-list-panel">
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: 'var(--color-secondary)' }}>
                Alumnos Inscritos ({submissions.length})
              </h4>
              {submissions.length === 0 && (
                <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>No hay alumnos inscritos en este curso.</p>
              )}
              {submissions.map((sub) => {
                const isSelected = selectedSub?.userId === sub.userId;
                return (
                  <div
                    key={sub.userId}
                    className={`student-grading-card ${isSelected ? 'student-grading-card--selected' : ''}`}
                    onClick={() => handleSelectStudent(sub)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p className="student-grading-card__name">{sub.student?.name || 'Estudiante'}</p>
                      {sub.status === 'pending' && <span className="status-badge status-badge--pending">Pendiente</span>}
                      {sub.status === 'submitted' && <span className="status-badge status-badge--submitted">Entregado</span>}
                      {sub.status === 'late' && <span className="status-badge status-badge--late">Retraso</span>}
                      {sub.status === 'graded' && (
                        <span className="status-badge status-badge--graded">
                          {sub.score}/{task.maxScore}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Panel Derecho: Detalle de Entrega y Formulario de Calificación */}
            <div className="submission-detail-panel">
              {selectedSub ? (
                <>
                  <div style={{ borderBottom: '1px solid var(--color-secondary)', paddingBottom: '0.75rem' }}>
                    <h3 style={{ margin: '0 0 0.25rem' }}>{selectedSub.student?.name}</h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-secondary)' }}>
                      {selectedSub.student?.email}
                    </p>
                  </div>

                  {/* Archivos y Links de la entrega */}
                  <div className="task-form__field">
                    <label className="task-form__label">
                      Estado de Entrega: {selectedSub.status === 'pending' ? 'Sin entregar' : formatDateTime(selectedSub.submissionDate)}
                    </label>
                    <div className="attachments-list">
                      {selectedSub.files && selectedSub.files.length > 0 ? (
                        selectedSub.files.map((file) => (
                          <a
                            key={file.id}
                            href={getFileUrl(file.url)}
                            target="_blank"
                            rel="noreferrer"
                            className="attachment-chip"
                          >
                            {file.type === 'file' ? '📄 Descargar archivo' : '🔗 Ver enlace'}: {file.url}
                          </a>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-secondary)' }}>
                          {selectedSub.status === 'pending'
                            ? 'El estudiante aún no ha enviado su entrega.'
                            : 'Entrega enviada sin archivos ni enlaces.'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Formulario de Calificación */}
                  <form className="grading-form" onSubmit={handleGradeSubmit}>
                    <h4 style={{ margin: 0 }}>Evaluar y Calificar</h4>

                    <div className="task-form__field">
                      <label className="task-form__label">
                        Nota (0 a {task.maxScore}) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={task.maxScore}
                        step="0.5"
                        className="task-form__input"
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        placeholder={`Ej: 85`}
                        required
                        disabled={!selectedSub.id}
                      />
                    </div>

                    <div className="task-form__field">
                      <label className="task-form__label">Comentarios / Feedback para el alumno</label>
                      <textarea
                        className="task-form__textarea"
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Escribe recomendaciones, observaciones o felicitaciones..."
                        disabled={!selectedSub.id}
                      />
                    </div>

                    {!selectedSub.id && (
                      <p style={{ fontSize: '0.8rem', color: '#ef4444', margin: 0 }}>
                        * El alumno aún no ha realizado la entrega. Espera a que entregue para calificar.
                      </p>
                    )}

                    <button
                      type="submit"
                      className="task-modal__btn task-modal__btn--primary"
                      disabled={gradingLoading || !selectedSub.id}
                      style={{ alignSelf: 'flex-end' }}
                    >
                      {gradingLoading ? 'Guardando...' : 'Guardar Calificación'}
                    </button>
                  </form>
                </>
              ) : (
                <p style={{ textAlign: 'center', margin: 'auto', opacity: 0.7 }}>
                  Selecciona un alumno de la lista para ver su entrega.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="task-modal__actions">
          <button
            type="button"
            className="task-modal__btn task-modal__btn--secondary"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherGradingModal;
