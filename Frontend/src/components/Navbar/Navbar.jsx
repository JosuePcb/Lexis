import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoSunnyOutline, IoMoonOutline } from "react-icons/io5";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
    const { user, isAuthenticated, logout, isTeacher } = useAuth();
    const navigate = useNavigate();
    const [themeColor, setThemeColor] = useState(false); // Si es falso sera modo claro, si es true sera modo oscuro
    const [menuOpen, setMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const userMenuRef = useRef(null);

    // Cerrar los menús al hacer click fuera
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

    const handleMenuOption = (action) => {
        setMenuOpen(false);
        setUserMenuOpen(false);
        if (action) action();
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    // Iniciales del usuario para el avatar por defecto
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

    // PARA EL MODO OSCURO/CLARO
    useEffect(() => {
        if (themeColor) {
            document.documentElement.setAttribute("data-theme", "dark");
        } else {
            document.documentElement.setAttribute("data-theme", "light");
        }
    }, [themeColor]);
    
    return (
        <nav className="navbar">
            <Link to="/home" className="navbar__brand">
                Lexis
            </Link>

            <div className="navbar__controls">
                <button className="navbar__toggle-mode"
                    onClick={handleThemeColor}>
                    <IoSunnyOutline className={`navbar__theme-icon ${themeColor ? 'icon-enter' : 'icon-exit'}`} />

                    <IoMoonOutline className={`navbar__theme-icon ${!themeColor ? 'icon-enter' : 'icon-exit'}`} />
                </button>
                
                {/* Botón para unirse o crear aula virtual (Solo si está autenticado) */}
                {isAuthenticated && (
                    <div className="navbar__menu-wrapper" ref={menuRef}>
                        <button
                            className="navbar__add-btn"
                            onClick={() => setMenuOpen((prev) => !prev)}>
                            <span className="navbar__add-icon">+</span>
                        </button>

                        <div className={`navbar__dropdown ${menuOpen ? "navbar__dropdown--open" : ""}`}>
                            {isTeacher() && (
                                <button
                                    className="navbar__dropdown-item"
                                    onClick={() => handleMenuOption(() => console.log("Nueva sala"))}> 
                                    Crear Aula
                                </button>
                            )}
                            <button
                                className="navbar__dropdown-item"
                                onClick={() => handleMenuOption(() => console.log("Invitar personas"))}>
                                Unirse a un Aula
                            </button>
                        </div>
                    </div>
                )}

                {/* Autenticación / Avatar */}
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
                    <Link to="/login" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                        Iniciar Sesión
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;