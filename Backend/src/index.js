import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import "dotenv/config";

// Asegurar existencia de carpeta uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Rutas
import authRoutes from "./routes/authRoutes.js";
import classroomRoutes from "./routes/classroomRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import gradeRoutes from "./routes/gradeRoutes.js";

import { sequelize } from "./models/index.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadDir));

// Endpoints
app.use("/api/auth", authRoutes);
app.use("/api/classrooms", classroomRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/grades", gradeRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Lexis API funciona" });
});

// Sincronizar la base de datos y levantar el servidor
try {
  // alter: true sincroniza la estructura actual de los modelos con la base de datos
  await sequelize.sync({ alter: true });
  console.log("✅ Base de datos sincronizada correctamente.");

  app.listen(PORT, () => {
    console.log(`Backend corriendo en http://localhost:${PORT}`);
  });
} catch (error) {
  console.error("❌ Error al sincronizar la base de datos:", error);
}
