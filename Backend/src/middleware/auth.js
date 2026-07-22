import jwt from "jsonwebtoken";

/**
 * Middleware que verifica la validez de un JWT en el header de la petición.
 * Si el token es válido, decodifica el payload y lo adjunta a req.user.
 * Debe ejecutarse ANTES de authorizeRoles para que req.user esté disponible.

 * Header esperado: Authorization: Bearer <token>
 */
export const authenticateToken = (req, res, next) => {
  // Extraer el header completo de autorización
  const authHeader = req.headers["authorization"];

  // Obtener solo el token quitando el prefijo "Bearer "
  // Si authHeader es undefined, el operador && devuelve undefined (no lanza error)
  const token = authHeader && authHeader.split(" ")[1];

  // Si no se envió token, rechazar con 401 (Unauthorized)
  if (!token) {
    return res.status(401).json({ message: "Access token missing or invalid" });
  }

  // Verificar y decodificar el token usando la clave secreta del .env
  jwt.verify(token, process.env.JWT_SECRET || "default_secret", (err, user) => {
    // Si hay error (token expirado, firma inválida, etc.), rechazar con 403 (Forbidden)
    if (err) {
      return res.status(403).json({ message: "Token expired or invalid" });
    }

    // Token válido: guardar el payload decodificado en req.user para uso posterior
    req.user = user;

    // Continuar con el siguiente middleware o controlador de la ruta
    next();
  });
};


export const authorizeRoles = (...roles) => {
  // Retorna un middleware que recibe req, res, next de Express
  return (req, res, next) => {
    // Si el usuario no existe en req.user o su rol no está en la lista, rechazar
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Unauthorized resource access" });
    }

    // Rol autorizado: continuar con la siguiente función en la cadena
    next();
  };
};
