import { Router } from "express";
import {
  getTeacherGradebook,
  getStudentGradebook,
} from "../controllers/gradeController.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

const router = Router();

// GET /api/grades/classroom/:classroomId/teacher — Libreta de calificaciones vista docente
router.get("/classroom/:classroomId/teacher", authenticateToken, authorizeRoles("teacher"), getTeacherGradebook);
// GET /api/grades/classroom/:classroomId/student — Libreta de calificaciones vista estudiante
router.get("/classroom/:classroomId/student", authenticateToken, authorizeRoles("student"), getStudentGradebook);

export default router;
