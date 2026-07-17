import { Roomcard } from "../components";
import "./Home.css";

// Datos mockup — se reemplazarán por un llamado a la API
const MOCK_ROOMS = [
    { id: 1, name: "Teoría de Sistemas",     teacherName: "Josue Hernandez", seccion: "DCM0801" },
    { id: 2, name: "Calculo Diferencial",    teacherName: "Ana García",      seccion: "MAT1102" },
    { id: 3, name: "Programación Web",       teacherName: "Carlos Méndez",   seccion: "INF2204" },
    { id: 4, name: "Base de Datos I",        teacherName: "Laura Pérez",     seccion: "DCM0705" },
    { id: 5, name: "Algebra Lineal",         teacherName: "Roberto Díaz",    seccion: "MAT0901" },
    { id: 6, name: "Redes de Computadoras",  teacherName: "María Soto",      seccion: "INF3301" },
];

const Home = () => {
    return (
        <main className="home">
            <section className="home__grid">
                {MOCK_ROOMS.map((room) => (
                    <Roomcard
                        key={room.id}
                        name={room.name}
                        teacherName={room.teacherName}
                        seccion={room.seccion}
                    />
                ))}
            </section>
        </main>
    );
};

export default Home;
