// StudentTaskModal.jsx — Modal de entrega y visualización de tarea para estudiantes
import { useState, useEffect } from 'react';
import { api } from '../../api';
import './TaskModal.css';

const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getFileUrl = (url) => {
  if (!url) return '';
  return url.startsWith('/') ? `http://localhost:3000${url}` : url;
};

const StudentTaskModal = ({ isOpen, onClose, task, onSuccess }) => {
  const [taskDetail, setTaskDetail] = useState(task);
  const [links, setLinks] = useState(['']);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    let isMounted = true;
    if (isOpen && task?.id) {
      api.getTaskById(task.id)
        .then((updated) => {
          if (isMounted) setTaskDetail(updated);
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, task?.id]);

  if (!isOpen || !taskDetail) return null;

  const mySubmission = taskDetail.mySubmission;
  const status = taskDetail.status || (mySubmission ? mySubmission.status : 'pending');

  const handleAddLink = () => {
    setLinks((prev) => [...prev, '']);
  };

  const handleLinkChange = (index, value) => {
    setLinks((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleRemoveLink = (index) => {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');

      const formData = new FormData();
      const validLinks = links.filter((l) => l.trim() !== '');
      formData.append('links', JSON.stringify(validLinks));

      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      const updatedSub = await api.submitTask(taskDetail.id, formData);
      setTaskDetail((prev) => ({
        ...prev,
        mySubmission: updatedSub,
        status: updatedSub.status,
        score: updatedSub.score,
      }));
      setSuccessMsg('¡Tarea entregada con éxito!');
      onSuccess();
    } catch (err) {
      setError(err.message || 'Error al entregar la tarea');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubmit = async () => {
    const confirm = window.confirm('¿Estás seguro de que deseas anular la entrega?');
    if (!confirm) return;

    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');

      await api.unsubmitTask(taskDetail.id);
      setTaskDetail((prev) => ({
        ...prev,
        mySubmission: null,
        status: 'pending',
        score: null,
      }));
      setSuccessMsg('Entrega anulada.');
      onSuccess();
    } catch (err) {
      setError(err.message || 'Error al anular la entrega');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-modal-overlay" onClick={onClose}>
      <div className="task-modal" onClick={(e) => e.stopPropagation()}>
        <div className="task-modal__header">
          <h2 className="task-modal__title">{taskDetail.title}</h2>
          <button className="task-modal__close-btn" onClick={onClose} aria-label="Cerrar">
            &times;
          </button>
        </div>

        {error && <div className="task-modal__error">{error}</div>}
        {successMsg && <div className="task-modal__success">{successMsg}</div>}

        {/* Info general de la tarea */}
        <div className="task-info">
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
            {status === 'pending' && <span className="status-badge status-badge--pending">Pendiente</span>}
            {status === 'submitted' && <span className="status-badge status-badge--submitted">Entregado</span>}
            {status === 'late' && <span className="status-badge status-badge--late">Entregado con retraso</span>}
            {status === 'graded' && <span className="status-badge status-badge--graded">Calificado</span>}
            <span style={{ fontSize: '0.85rem', color: 'var(--color-secondary)' }}>
              Vence: {formatDateTime(taskDetail.dueDate)}
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, marginLeft: 'auto' }}>
              Puntos: {taskDetail.maxScore}
            </span>
          </div>

          {taskDetail.instructions && (
            <p style={{ lineHeight: '1.5', whiteSpace: 'pre-wrap', margin: '0.5rem 0 1rem' }}>
              {taskDetail.instructions}
            </p>
          )}

          {/* Adjuntos del docente */}
          {taskDetail.attachments && taskDetail.attachments.length > 0 && (
            <div className="task-form__field">
              <label className="task-form__label">Material Adjunto del Docente:</label>
              <div className="attachments-list">
                {taskDetail.attachments.map((att) => (
                  <a
                    key={att.id}
                    href={getFileUrl(att.url)}
                    target="_blank"
                    rel="noreferrer"
                    className="attachment-chip"
                  >
                    {att.type === 'file' ? '📁 Descargar archivo' : '🔗 Enlace:'} {att.url}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Panel de Calificación recibida */}
        {status === 'graded' && mySubmission && (
          <div style={{ background: 'var(--color-card)', padding: '1rem', borderRadius: '8px', border: '1.5px solid var(--color-secondary)' }}>
            <h4 style={{ margin: '0 0 0.5rem', color: 'var(--color-accent)' }}>Calificación Recibida</h4>
            <p style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 0.5rem' }}>
              Nota: {mySubmission.score} / {taskDetail.maxScore}
            </p>
            {mySubmission.teacherComment && (
              <p style={{ fontSize: '0.9rem', fontStyle: 'italic', margin: 0 }}>
                Comentario del docente: "{mySubmission.teacherComment}"
              </p>
            )}
          </div>
        )}

        {/* Panel de entrega (si ya entregó o está calificado, muestra lo entregado) */}
        {(status === 'submitted' || status === 'late' || status === 'graded') && mySubmission && (
          <div className="task-form__field">
            <label className="task-form__label">Tu Entrega ({formatDateTime(mySubmission.submissionDate)}):</label>
            <div className="attachments-list">
              {mySubmission.files && mySubmission.files.length > 0 ? (
                mySubmission.files.map((file) => (
                  <a
                    key={file.id}
                    href={getFileUrl(file.url)}
                    target="_blank"
                    rel="noreferrer"
                    className="attachment-chip"
                  >
                    {file.type === 'file' ? '📄 Archivo entregado' : '🔗 Enlace entregado'}: {file.url}
                  </a>
                ))
              ) : (
                <span style={{ fontSize: '0.85rem', color: 'var(--color-secondary)' }}>Sin archivos adjuntos</span>
              )}
            </div>
          </div>
        )}

        {/* Formulario de entrega (solo si status === 'pending') */}
        {status === 'pending' && (
          <form className="task-form" onSubmit={handleSubmit}>
            <div className="task-form__field">
              <label className="task-form__label">Agregar Enlaces</label>
              <div className="task-links-list">
                {links.map((link, idx) => (
                  <div key={idx} className="task-link-item">
                    <input
                      type="url"
                      className="task-form__input task-link-item__input"
                      placeholder="https://github.com/..."
                      value={link}
                      onChange={(e) => handleLinkChange(idx, e.target.value)}
                    />
                    {links.length > 1 && (
                      <button
                        type="button"
                        className="task-btn-icon"
                        onClick={() => handleRemoveLink(idx)}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="task-btn-add"
                  onClick={handleAddLink}
                >
                  + Agregar enlace
                </button>
              </div>
            </div>

            <div className="task-form__field">
              <label className="task-form__label">Subir Archivos (PDF, Word, PNG... Max 10MB c/u)</label>
              <input
                type="file"
                multiple
                className="task-form__input"
                onChange={handleFileChange}
              />
              {selectedFiles.length > 0 && (
                <div className="attachments-list">
                  {selectedFiles.map((file, idx) => (
                    <span key={idx} className="attachment-chip">
                      📄 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="task-modal__actions">
              <button
                type="button"
                className="task-modal__btn task-modal__btn--secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cerrar
              </button>
              <button
                type="submit"
                className="task-modal__btn task-modal__btn--primary"
                disabled={loading}
              >
                {loading ? 'Entregando...' : 'Entregar Tarea'}
              </button>
            </div>
          </form>
        )}

        {/* Acciones para entregas enviadas */}
        {(status === 'submitted' || status === 'late') && (
          <div className="task-modal__actions">
            <button
              type="button"
              className="task-modal__btn task-modal__btn--secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cerrar
            </button>
            <button
              type="button"
              className="task-modal__btn task-modal__btn--danger"
              onClick={handleUnsubmit}
              disabled={loading}
            >
              {loading ? 'Anulando...' : 'Anular Entrega'}
            </button>
          </div>
        )}

        {status === 'graded' && (
          <div className="task-modal__actions">
            <p style={{ fontSize: '0.82rem', color: 'var(--color-secondary)', margin: 'auto 0' }}>
              * Esta entrega ya ha sido calificada y no se puede anular.
            </p>
            <button
              type="button"
              className="task-modal__btn task-modal__btn--secondary"
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentTaskModal;
