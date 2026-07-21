import { Router } from "express";
import {
  createAnnouncement,
  createComment,
  getClassroomWall,
} from "../controllers/postController.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

const router = Router();

// POST /api/posts — Publica un anuncio en un aula (solo teacher)
router.post("/", authenticateToken, authorizeRoles("teacher"), createAnnouncement);
// POST /api/posts/:id/comments — Agrega un comentario a un anuncio
router.post("/:id/comments", authenticateToken, createComment);
// GET /api/posts/classroom/:classroomId — Obtiene el muro de publicaciones de un aula
router.get("/classroom/:classroomId", authenticateToken, getClassroomWall);

export default router;
