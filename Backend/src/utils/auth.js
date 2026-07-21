// Encriptar y comparar contraseñas / Generar Token de JWT

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Tiempo de expiracion y clave secreta para jwt, con valores default por si no esta en el .env
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h"; 


// Recibe la contrasena sin hashear
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Recibe la contrasena sin hashear y la hasheada
export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

// Recibe el usuario y genera un token
export const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN }); // Firma el JWT con el secret y el expire
};
