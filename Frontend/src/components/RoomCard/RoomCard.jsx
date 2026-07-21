// RoomCard.jsx — Tarjeta que representa un aula virtual en la grilla de Home.
// Muestra el nombre del aula, el docente y la sección.
// El prop id se pasa para uso futuro (navegación al detalle del aula).

import "./RoomCard.css";

const RoomCard = ({ name, teacherName, seccion }) => {
    return (
        <article className="roomcard">
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
