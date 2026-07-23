import { Router } from "express";
import {
  createTask,
  getTasksByCourse,
  getTaskById,
  updateTask,
  deleteTask,
  submitTask,
  unsubmitTask,
  getSubmissions,
  gradeSubmission,
} from "../controllers/taskController.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";
import { upload, handleUpload } from "../utils/upload.js";

const router = Router();

// POST /api/tasks — Crea una tarea en un aula (solo teacher, soporta adjuntos de archivo y links)
router.post(
  "/",
  authenticateToken,
  authorizeRoles("teacher"),
  handleUpload(upload.array("files")),
  createTask
);

// GET /api/tasks/course/:courseId — Obtiene todas las tareas de un curso (con mi estado de entrega si soy alumno)
router.get("/course/:courseId", authenticateToken, getTasksByCourse);

// GET /api/tasks/:id — Obtiene el detalle de una tarea específica
router.get("/:id", authenticateToken, getTaskById);

// PUT /api/tasks/:id — Actualiza los datos de una tarea (solo teacher)
router.put("/:id", authenticateToken, authorizeRoles("teacher"), updateTask);

// DELETE /api/tasks/:id — Elimina una tarea (solo teacher)
router.delete("/:id", authenticateToken, authorizeRoles("teacher"), deleteTask);

// POST /api/tasks/:id/submit — Entrega una tarea (solo student, soporta archivos y links)
router.post(
  "/:id/submit",
  authenticateToken,
  authorizeRoles("student"),
  handleUpload(upload.array("files")),
  submitTask
);

// POST /api/tasks/:id/unsubmit — Anula la entrega de una tarea (solo student, bloqueado si ya fue calificada)
router.post("/:id/unsubmit", authenticateToken, authorizeRoles("student"), unsubmitTask);

// GET /api/tasks/:id/submissions — Lista todas las entregas de una tarea (solo teacher)
router.get("/:id/submissions", authenticateToken, authorizeRoles("teacher"), getSubmissions);

// POST y PUT /api/tasks/submissions/:submissionId/grade — Califica o actualiza la nota de una entrega (solo teacher)
router.post("/submissions/:submissionId/grade", authenticateToken, authorizeRoles("teacher"), gradeSubmission);
router.put("/submissions/:submissionId/grade", authenticateToken, authorizeRoles("teacher"), gradeSubmission);

export default router;
