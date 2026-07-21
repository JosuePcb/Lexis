// CreateClassroomModal — Modal para que el docente cree un nuevo aula virtual.
// Muestra un formulario con nombre (requerido), sección y descripción (opcionales).
// Al enviar, llama a POST /api/classrooms y muestra el courseCode generado al docente.

import { useState } from "react";
import { api } from "../../api";
import "./ClassroomModal.css";

export const CreateClassroomModal = ({ onClose, onCreated }) => {
  const [name, setName] = useState("");
  const [section, setSection] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // courseCode se guarda después de crear el aula para mostrarlo al docente
  const [courseCode, setCourseCode] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Envía los datos del formulario al backend
      const classroom = await api.post("/classrooms", { name, section, description });
      // Guarda el código generado para mostrar la pantalla de confirmación
      setCourseCode(classroom.courseCode);
      // Notifica al padre (Navbar) para que refresque la lista de aulas en Home
      onCreated(classroom);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Después de crear el aula, muestra una pantalla con el código para compartir
  if (courseCode) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <h2 className="modal__title">Aula Creada</h2>
          <p className="modal__text">Comparte este código con tus estudiantes:</p>
          <div className="modal__code">{courseCode}</div>
          <button className="modal__btn modal__btn--primary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  // Formulario de creación del aula
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal__title">Crear Aula</h2>

        {error && (
          <div className="modal__error">{error}</div>
        )}

        <form className="modal__form" onSubmit={handleSubmit}>
          <div className="modal__field">
            <label className="modal__label" htmlFor="classroom-name">Nombre del Aula *</label>
            <input
              id="classroom-name"
              className="modal__input"
              type="text"
              required
              placeholder="Ej: Programación Web"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="modal__field">
            <label className="modal__label" htmlFor="classroom-section">Sección</label>
            <input
              id="classroom-section"
              className="modal__input"
              type="text"
              placeholder="Ej: INF2204"
              value={section}
              onChange={(e) => setSection(e.target.value)}
            />
          </div>

          <div className="modal__field">
            <label className="modal__label" htmlFor="classroom-desc">Descripción</label>
            <textarea
              id="classroom-desc"
              className="modal__input modal__textarea"
              placeholder="Descripción opcional del aula..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="modal__actions">
            <button type="button" className="modal__btn modal__btn--secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="modal__btn modal__btn--primary" disabled={loading}>
              {loading ? "Creando..." : "Crear Aula"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
