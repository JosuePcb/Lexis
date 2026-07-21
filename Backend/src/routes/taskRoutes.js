import { Router } from "express";
import {
  createTask,
  submitTask,
  gradeSubmission,
  getSubmissions,
} from "../controllers/taskController.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

const router = Router();

// POST /api/tasks — Crea una tarea en un aula (solo teacher)
router.post("/", authenticateToken, authorizeRoles("teacher"), createTask);
// POST /api/tasks/:id/submit — Entrega una tarea (solo student)
router.post("/:id/submit", authenticateToken, authorizeRoles("student"), submitTask);
// PUT /api/tasks/submissions/:submissionId/grade — Califica una entrega (solo teacher)
router.put("/submissions/:submissionId/grade", authenticateToken, authorizeRoles("teacher"), gradeSubmission);
// GET /api/tasks/:id/submissions — Lista las entregas de una tarea
router.get("/:id/submissions", authenticateToken, getSubmissions);

export default router;
