import { Router } from "express";
import {
  getTeacherGradebook,
  getStudentGradebook,
} from "../controllers/gradeController.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

const router = Router();

router.get("/classroom/:classroomId/teacher", authenticateToken, authorizeRoles("docente"), getTeacherGradebook);
router.get("/classroom/:classroomId/student", authenticateToken, authorizeRoles("estudiante"), getStudentGradebook);

export default router;
