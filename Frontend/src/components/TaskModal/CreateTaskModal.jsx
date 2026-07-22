// CreateTaskModal.jsx — Modal para crear y editar tareas (solo docente)
import { useState, useEffect } from 'react';
import { api } from '../../api';
import './TaskModal.css';

const toDatetimeLocal = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const CreateTaskModal = ({ isOpen, onClose, onSuccess, courseId, taskToEdit = null }) => {
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxScore, setMaxScore] = useState(100);
  const [links, setLinks] = useState(['']);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setInstructions(taskToEdit.instructions || taskToEdit.description || '');
      setDueDate(toDatetimeLocal(taskToEdit.dueDate));
      setMaxScore(taskToEdit.maxScore || 100);
      const existingLinks = taskToEdit.attachments
        ?.filter((a) => a.type === 'link')
        .map((a) => a.url);
      setLinks(existingLinks && existingLinks.length > 0 ? existingLinks : ['']);
      setSelectedFiles([]);
    } else {
      setTitle('');
      setInstructions('');
      setDueDate('');
      setMaxScore(100);
      setLinks(['']);
      setSelectedFiles([]);
    }
    setError('');
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

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
    if (!title.trim()) {
      setError('El título de la tarea es obligatorio');
      return;
    }
    if (!dueDate) {
      setError('La fecha de entrega es obligatoria');
      return;
    }
    if (isNaN(maxScore) || Number(maxScore) <= 0) {
      setError('El puntaje máximo debe ser mayor a 0');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (taskToEdit) {
        await api.updateTask(taskToEdit.id, {
          title: title.trim(),
          instructions: instructions.trim(),
          dueDate,
          maxScore: Number(maxScore),
        });
      } else {
        const formData = new FormData();
        formData.append('courseId', courseId);
        formData.append('title', title.trim());
        formData.append('instructions', instructions.trim());
        formData.append('dueDate', dueDate);
        formData.append('maxScore', maxScore);

        const validLinks = links.filter((l) => l.trim() !== '');
        formData.append('links', JSON.stringify(validLinks));

        selectedFiles.forEach((file) => {
          formData.append('files', file);
        });

        await api.createTask(formData);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar la tarea');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-modal-overlay" onClick={onClose}>
      <div className="task-modal" onClick={(e) => e.stopPropagation()}>
        <div className="task-modal__header">
          <h2 className="task-modal__title">
            {taskToEdit ? 'Editar Tarea' : 'Crear Nueva Tarea'}
          </h2>
          <button className="task-modal__close-btn" onClick={onClose} aria-label="Cerrar">
            &times;
          </button>
        </div>

        {error && <div className="task-modal__error">{error}</div>}

        <form className="task-form" onSubmit={handleSubmit}>
          <div className="task-form__field">
            <label className="task-form__label">Título de la tarea *</label>
            <input
              type="text"
              className="task-form__input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Guía de Ejercicios N° 1"
              required
            />
          </div>

          <div className="task-form__field">
            <label className="task-form__label">Instrucciones</label>
            <textarea
              className="task-form__textarea"
              rows={4}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Detalla las instrucciones para los estudiantes..."
            />
          </div>

          <div className="task-form__row">
            <div className="task-form__field">
              <label className="task-form__label">Fecha y hora de entrega *</label>
              <input
                type="datetime-local"
                className="task-form__input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>

            <div className="task-form__field">
              <label className="task-form__label">Puntaje Máximo *</label>
              <input
                type="number"
                min="1"
                step="1"
                className="task-form__input"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                required
              />
            </div>
          </div>

          {!taskToEdit && (
            <>
              <div className="task-form__field">
                <label className="task-form__label">Enlaces de referencia</label>
                <div className="task-links-list">
                  {links.map((link, idx) => (
                    <div key={idx} className="task-link-item">
                      <input
                        type="url"
                        className="task-form__input task-link-item__input"
                        placeholder="https://..."
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
                <label className="task-form__label">Archivos adjuntos (PDF, Doc, PNG... Max 10MB c/u)</label>
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
            </>
          )}

          <div className="task-modal__actions">
            <button
              type="button"
              className="task-modal__btn task-modal__btn--secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="task-modal__btn task-modal__btn--primary"
              disabled={loading}
            >
              {loading ? 'Guardando...' : taskToEdit ? 'Guardar Cambios' : 'Crear Tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
