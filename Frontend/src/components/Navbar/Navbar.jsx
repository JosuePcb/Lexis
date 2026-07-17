import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { IoSunnyOutline, IoMoonOutline } from "react-icons/io5";
import "./Navbar.css";

// QUE ME FALTA ACA?
// Colocar el llamado a api para obtener informacion del usuario, ademas debo de configurar el handle para los botones de unirse a un aula o crear un aula

const Navbar = ({ userName = "Usuario", userAvatar = null }) => {

    const [themeColor, setThemeColor] = useState(false); // Si es falso sera modo claro, si es true sera modo oscuro
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    // Cerrar el menú al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    const handleMenuOption = (action) => {
        setMenuOpen(false);
        if (action) action();
    };

    // Iniciales del usuario para el avatar por defecto
    const initials = userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

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
                
                {/* Botón para unirse o crear aula virtual */}
                <div className="navbar__menu-wrapper" ref={menuRef}>
                    <button
                        className="navbar__add-btn"
                        onClick={() => setMenuOpen((prev) => !prev)}>
                        <span className="navbar__add-icon">+</span>
                    </button>

                    
                    <div className={`navbar__dropdown ${menuOpen ? "navbar__dropdown--open" : ""}`}>

                        <button
                            className="navbar__dropdown-item"
                            onClick={() => handleMenuOption(() => console.log("Nueva sala"))}> 
                            Crear Aula
                        </button>
                        <button
                            className="navbar__dropdown-item"
                            onClick={() => handleMenuOption(() => console.log("Invitar personas"))}>
                            Unirse a un Aula
                        </button>
                    </div>
                </div>

                
                {/* Avatar circular */}
                <button className="navbar__avatar">
                    {userAvatar ? (
                        <img src={userAvatar} alt={userName} className="navbar__avatar-img" />
                    ) : (
                        <span className="navbar__avatar-initials">{initials}</span>
                    )}
                </button>
            </div>
        </nav>
    );
};

export default Navbar;