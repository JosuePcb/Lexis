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