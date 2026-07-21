import { Router } from "express";
import {
  getClassrooms,
  createClassroom,
  updateClassroom,
  joinClassroom,
  getClassroomStudents,
  kickStudent,
} from "../controllers/classroomController.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

const router = Router();

// GET /api/classrooms — Lista las aulas del usuario (teacher: sus cursos, student: inscritos)
router.get("/", authenticateToken, getClassrooms);
// POST /api/classrooms — Crea un aula (solo teacher). Genera courseCode único automáticamente.
router.post("/", authenticateToken, authorizeRoles("teacher"), createClassroom);
// PUT /api/classrooms/:id — Edita un aula (solo teacher dueño del curso)
router.put("/:id", authenticateToken, authorizeRoles("teacher"), updateClassroom);
// POST /api/classrooms/join — Se une a un aula con courseCode (solo student)
router.post("/join", authenticateToken, authorizeRoles("student"), joinClassroom);
// GET /api/classrooms/:id/students — Lista los estudiantes inscritos en un aula
router.get("/:id/students", authenticateToken, getClassroomStudents);
// DELETE /api/classrooms/:id/students/:studentId — Expulsa a un estudiante (solo teacher)
router.delete("/:id/students/:studentId", authenticateToken, authorizeRoles("teacher"), kickStudent);

export default router;
