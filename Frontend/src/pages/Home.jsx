// Home.jsx — Página principal que muestra la grilla de aulas del usuario.
// Al montarse, llama a GET /api/classrooms para obtener las aulas reales del backend.
// Muestra estados de carga, error, vacío o la grilla de RoomCards.
// Se re-monta (refresh) cuando App.jsx cambia el classroomRefreshKey después de crear/unirse.

import { useState, useEffect, useCallback } from "react";
import { Roomcard } from "../components";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import "./Home.css";

const Home = () => {
    const { isAuthenticated } = useAuth();
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch de aulas desde la API. Se memoriza con useCallback para evitar re-renders innecesarios.
    const fetchClassrooms = useCallback(async () => {
        // Si no hay sesión, no hace la petición
        if (!isAuthenticated) {
            setClassrooms([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await api.get("/classrooms");
            setClassrooms(data);
            setError("");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    // Ejecuta el fetch al montar el componente o cuando cambia la autenticación
    useEffect(() => {
        fetchClassrooms();
    }, [fetchClassrooms]);

    return (
        <main className="home">
            {/* Estado de carga */}
            {loading && (
                <p className="home__message">Cargando aulas...</p>
            )}

            {/* Estado de error */}
            {!loading && error && (
                <p className="home__message home__message--error">{error}</p>
            )}

            {/* Estado vacío — usuario sin aulas */}
            {!loading && !error && classrooms.length === 0 && (
                <p className="home__message">No tienes aulas aún</p>
            )}

            {/* Grilla de aulas — se renderiza cuando hay datos */}
            {!loading && !error && classrooms.length > 0 && (
                <section className="home__grid">
                    {classrooms.map((room) => (
                        <Roomcard
                            key={room.id}
                            id={room.id}
                            name={room.name}
                            teacherName={room.teacher?.name || "N/A"}
                            seccion={room.section || "Sin sección"}
                        />
                    ))}
                </section>
            )}
        </main>
    );
};

export default Home;
