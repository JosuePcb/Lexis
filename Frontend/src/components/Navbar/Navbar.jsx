// Navbar.jsx — Barra de navegación principal.
// Muestra: brand "Lexis", toggle de tema, menú de crear/unirse a aula (según rol),
// avatar del usuario con menú de cerrar sesión.
// Recibe onClassroomChange para notificar a App.jsx cuando se crea o se une a un aula.

import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoSunnyOutline, IoMoonOutline } from "react-icons/io5";
import { useAuth } from "../../context/AuthContext";
import { CreateClassroomModal, JoinClassroomModal } from "../index";
import "./Navbar.css";

const Navbar = ({ onClassroomChange }) => {
    const { user, isAuthenticated, logout, isTeacher } = useAuth();
    const navigate = useNavigate();
    const [themeColor, setThemeColor] = useState(false); // false = claro, true = oscuro
    const [menuOpen, setMenuOpen] = useState(false); // Menú del botón +
    const [userMenuOpen, setUserMenuOpen] = useState(false); // Menú del avatar
    const [showCreateModal, setShowCreateModal] = useState(false); // Modal crear aula
    const [showJoinModal, setShowJoinModal] = useState(false); // Modal unirse a aula
    const menuRef = useRef(null);
    const userMenuRef = useRef(null);

    // Cierra los menús dropdown al hacer click fuera de ellos
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Cierra el menú y ejecuta la acción correspondiente
    const handleMenuOption = (action) => {
        setMenuOpen(false);
        setUserMenuOpen(false);
        if (action) action();
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    // Genera las iniciales del usuario para el avatar (máx 2 letras)
    const initials = user?.name
        ? user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()
        : "U";

    const handleThemeColor = () => {
        setThemeColor(!themeColor)
    }
    // Aplica el atributo data-theme al HTML según el estado del toggle
    useEffect(() => {
        if (themeColor) {
            document.documentElement.setAttribute("data-theme", "dark");
        } else {
            document.documentElement.setAttribute("data-theme", "light");
        }
    }, [themeColor]);

    // Callbacks que se ejecutan después de crear/unirse a un aula
    // Notifican a App.jsx para que refresque la lista de aulas en Home
    const handleClassroomCreated = () => {
        onClassroomChange?.();
    };

    const handleClassroomJoined = () => {
        onClassroomChange?.();
    };
    
    return (
        <>
            <nav className="navbar">
                <Link to="/home" className="navbar__brand">
                    Lexis
                </Link>

                <div className="navbar__controls">
                    {/* Botón de toggle modo oscuro/claro */}
                    <button className="navbar__toggle-mode"
                        onClick={handleThemeColor}>
                        <IoSunnyOutline className={`navbar__theme-icon ${themeColor ? 'icon-enter' : 'icon-exit'}`} />

                        <IoMoonOutline className={`navbar__theme-icon ${!themeColor ? 'icon-enter' : 'icon-exit'}`} />
                    </button>
                    
                    {/* Botón + con dropdown para crear/unirse a aula (solo si está autenticado) */}
                    {isAuthenticated && (
                        <div className="navbar__menu-wrapper" ref={menuRef}>
                            <button
                                className="navbar__add-btn"
                                onClick={() => setMenuOpen((prev) => !prev)}>
                                <span className="navbar__add-icon">+</span>
                            </button>

                            <div className={`navbar__dropdown ${menuOpen ? "navbar__dropdown--open" : ""}`}>
                                {/* Solo teachers ven "Crear Aula" */}
                                {isTeacher() && (
                                    <button
                                        className="navbar__dropdown-item"
                                        onClick={() => handleMenuOption(() => setShowCreateModal(true))}>
                                        Crear Aula
                                    </button>
                                )}
                                
                                {/* Solo students ven "Unirse a un Aula" */}
                                {!isTeacher() && (
                                    <button
                                        className="navbar__dropdown-item"
                                        onClick={() => handleMenuOption(() => setShowJoinModal(true))}>
                                        Unirse a un Aula
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Avatar del usuario con dropdown de perfil y cerrar sesión */}
                    {isAuthenticated ? (
                        <div className="navbar__menu-wrapper" ref={userMenuRef}>
                            <button 
                                className="navbar__avatar"
                                onClick={() => setUserMenuOpen((prev) => !prev)}
                            >
                                <span className="navbar__avatar-initials">{initials}</span>
                            </button>

                            <div className={`navbar__dropdown ${userMenuOpen ? "navbar__dropdown--open" : ""}`} style={{ right: 0 }}>
                                <div className="px-4 py-2 border-b border-gray-100">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                </div>
                                <button
                                    className="navbar__dropdown-item w-full text-left"
                                    onClick={() => handleMenuOption(handleLogout)}>
                                    Cerrar Sesión
                                </button>
                            </div>
                        </div>
                    ) : (
                        <Link to="/login" className="navbar__login-btn">
                            Iniciar Sesión
                        </Link>
                    )}
                </div>
            </nav>

            {/* Modales de crear/unirse a aula — se renderizan fuera del nav */}
            {showCreateModal && (
                <CreateClassroomModal
                    onClose={() => setShowCreateModal(false)}
                    onCreated={handleClassroomCreated}
                />
            )}

            {showJoinModal && (
                <JoinClassroomModal
                    onClose={() => setShowJoinModal(false)}
                    onJoined={handleClassroomJoined}
                />
            )}
        </>
    );
};

export default Navbar;
