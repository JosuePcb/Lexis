import { Router } from "express";
import {
  createTask,
  submitTask,
  gradeSubmission,
  getSubmissions,
} from "../controllers/taskController.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

const router = Router();

router.post("/", authenticateToken, authorizeRoles("docente"), createTask);
router.post("/:id/submit", authenticateToken, authorizeRoles("estudiante"), submitTask);
router.put("/submissions/:submissionId/grade", authenticateToken, authorizeRoles("docente"), gradeSubmission);
router.get("/:id/submissions", authenticateToken, getSubmissions);

export default router;
