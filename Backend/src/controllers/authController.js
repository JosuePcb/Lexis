// Este archivo maneja todo la logica de registro e inicio de sesion.

import { User } from "../models/index.js";
import { hashPassword, comparePassword, generateToken } from "../utils/auth.js";

// Helper simple para validar el formato de email
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Validación de Entrada (Límites del Sistema)
    const errors = {};
    if (!name || name.trim() === "") errors.name = "El nombre es obligatorio.";
    if (!email || !isValidEmail(email)) errors.email = "Debe proporcionar un correo electrónico válido.";
    if (!password || password.length < 6) errors.password = "La contraseña debe tener al menos 6 caracteres.";
    if (!role || !["teacher", "student"].includes(role)) {
      errors.role = "El rol debe ser 'teacher' o 'student'.";
    }

    if (Object.keys(errors).length > 0) { // Esta linea crea un objeto con los errores y verifica si tiene mas de 0 errores, si tiene mas de 0 errores, retorna un error 400
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Los datos de registro no son válidos.",
          details: errors, // Retorna los errores que hayan
        },
      });
    }

    // 2. Comprobar existencia del correo electrónico
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res.status(409).json({
        error: {
          code: "EMAIL_ALREADY_EXISTS",
          message: "El correo electrónico ya está registrado.",
        },
      });
    }

    // 3. Encriptación y Creación
    const hashedPassword = await hashPassword(password);
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
    });

    // 4. Generación de Token para Login Automático
    const token = generateToken(newUser); // Firma el token con la info del usuario, definido en utils/auth.js

    return res.status(201).json({
      message: "Usuario registrado con éxito.",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
      token, // Se envia el token en la response
    });
  } catch (error) { // Catch del try
    console.error("Error en el registro:", error);
    return res.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Ocurrió un error inesperado en el servidor.", 
      },
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validación de Entrada
    const errors = {};
    if (!email || !isValidEmail(email)) errors.email = "Debe proporcionar un correo electrónico válido.";
    if (!password) errors.password = "La contraseña es obligatoria.";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Los datos de inicio de sesión no son válidos.",
          details: errors,
        },
      });
    }

    // 2. Buscar Usuario
    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return res.status(401).json({
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Correo electrónico o contraseña incorrectos.",
        },
      });
    }

    // 3. Validar Contraseña
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Correo electrónico o contraseña incorrectos.",
        },
      });
    }

    // 4. Generar Token
    const token = generateToken(user);

    return res.status(200).json({
      message: "Inicio de sesión exitoso.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Error en el login:", error);
    return res.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Ocurrió un error inesperado en el servidor.",
      },
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    // req.user viene del middleware authenticateToken cargado con { id, email, role }
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        error: {
          code: "USER_NOT_FOUND",
          message: "El usuario no existe.",
        },
      });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    return res.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Ocurrió un error inesperado en el servidor.",
      },
    });
  }
};
