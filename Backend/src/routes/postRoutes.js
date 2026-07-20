import { Router } from "express";
import {
  createAnnouncement,
  createComment,
  getClassroomWall,
} from "../controllers/postController.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

const router = Router();

router.post("/", authenticateToken, authorizeRoles("docente"), createAnnouncement);
router.post("/:id/comments", authenticateToken, createComment);
router.get("/classroom/:classroomId", authenticateToken, getClassroomWall);

export default router;
