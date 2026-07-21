// JoinClassroomModal — Modal para que el estudiante se una a un aula virtual.
// Muestra un input donde ingresa el courseCode de 6 caracteres.
// Al enviar, llama a POST /api/classrooms/join y cierra el modal si fue exitoso.

import { useState } from "react";
import { api } from "../../api";
import "./ClassroomModal.css";

export const JoinClassroomModal = ({ onClose, onJoined }) => {
  const [courseCode, setCourseCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Envía el código al backend para unirse al aula
      const classroom = await api.post("/classrooms/join", { courseCode });
      // Notifica al padre (Navbar) para que refresque la lista de aulas en Home
      onJoined(classroom);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal__title">Unirse a un Aula</h2>

        {error && (
          <div className="modal__error">{error}</div>
        )}

        <form className="modal__form" onSubmit={handleSubmit}>
          <div className="modal__field">
            <label className="modal__label" htmlFor="join-code">Código del Aula *</label>
            <input
              id="join-code"
              className="modal__input modal__input--code"
              type="text"
              required
              placeholder="Ej: A1B2C3"
              maxLength={6}
              value={courseCode}
              // Convierte a mayúsculas en tiempo real para facilitar la entrada
              onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
            />
          </div>

          <div className="modal__actions">
            <button type="button" className="modal__btn modal__btn--secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="modal__btn modal__btn--primary" disabled={loading}>
              {loading ? "Uniéndose..." : "Unirse"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
