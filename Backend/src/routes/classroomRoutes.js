import { Router } from "express";
import {
  createClassroom,
  updateClassroom,
  joinClassroom,
  getClassroomStudents,
  kickStudent,
} from "../controllers/classroomController.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

const router = Router();

router.post("/", authenticateToken, authorizeRoles("docente"), createClassroom);
router.put("/:id", authenticateToken, authorizeRoles("docente"), updateClassroom);
router.post("/join", authenticateToken, joinClassroom);
router.get("/:id/students", authenticateToken, getClassroomStudents);
router.delete("/:id/students/:studentId", authenticateToken, authorizeRoles("docente"), kickStudent);

export default router;
