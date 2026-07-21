// RoomCard.jsx — Tarjeta que representa un aula virtual en la grilla de Home.
// Muestra el nombre del aula, el docente y la sección.
// Al hacer clic navega a /classroom/:id para ver el detalle del aula.

import { useNavigate } from "react-router-dom";
import "./RoomCard.css";

const RoomCard = ({ id, name, teacherName, seccion }) => {
    const navigate = useNavigate();

    // Navega a la página de detalle del aula al hacer clic en la tarjeta.
    // Pasa los datos básicos del aula como state para que ClassroomDetail
    // pueda mostrar el nombre sin necesitar un fetch adicional.
    const handleClick = () => {
        navigate(`/classroom/${id}`, { state: { name, teacherName, seccion } });
    };

    return (
        <article className="roomcard" onClick={handleClick} style={{ cursor: "pointer" }}>
            <div className="roomcard__body">
                <h2 className="roomcard__name">{name}</h2>
                <div className="roomcard__meta">
                    <p className="roomcard__teacher">{teacherName}</p>
                    <p className="roomcard__seccion">{seccion}</p>
                </div>
            </div>
        </article>
    );
};

export default RoomCard;
