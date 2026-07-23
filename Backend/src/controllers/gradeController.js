import { Course, Enrollment, User, Assignment, Submission } from "../models/index.js";

// GET /api/grades/classroom/:classroomId/teacher
// Devuelve una tabla de calificaciones: todos los alumnos (filas) x todas las tareas (columnas)
export const getTeacherGradebook = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const teacherId = req.user.id;

    const course = await Course.findByPk(classroomId);
    if (!course) {
      return res.status(404).json({ error: "Aula no encontrada" });
    }

    if (course.teacherId !== teacherId) {
      return res.status(403).json({ error: "Solo el docente puede ver la libreta de calificaciones" });
    }

    // Obtener todos los alumnos inscritos (excluyendo al docente)
    const enrollments = await Enrollment.findAll({
      where: { courseId: classroomId, status: "active" },
      include: [{ model: User, attributes: ["id", "name", "email"] }],
    });

    const students = enrollments
      .filter((e) => e.userId !== course.teacherId)
      .map((e) => ({
        id: e.User.id,
        name: e.User.name,
        email: e.User.email,
      }));

    // Obtener todas las tareas del curso
    const assignments = await Assignment.findAll({
      where: { courseId: classroomId },
      attributes: ["id", "title", "maxScore", "dueDate"],
      order: [["createdAt", "ASC"]],
    });

    // Obtener todas las entregas del curso
    const submissions = await Submission.findAll({
      where: { assignmentId: assignments.map((a) => a.id) },
      attributes: ["id", "assignmentId", "userId", "score", "status"],
    });

    // Indexar entregas por (assignmentId, userId) para acceso rápido
    const submissionMap = new Map();
    submissions.forEach((sub) => {
      submissionMap.set(`${sub.assignmentId}-${sub.userId}`, sub);
    });

    // Construir la tabla: cada alumno con sus calificaciones por tarea
    const rows = students.map((student) => {
      const grades = assignments.map((assignment) => {
        const sub = submissionMap.get(`${assignment.id}-${student.id}`);
        return {
          assignmentId: assignment.id,
          score: sub ? sub.score : null,
          maxScore: assignment.maxScore,
          status: sub ? sub.status : "pending",
        };
      });
      return {
        student,
        grades,
      };
    });

    return res.json({
      assignments: assignments.map((a) => ({
        id: a.id,
        title: a.title,
        maxScore: a.maxScore,
        dueDate: a.dueDate,
      })),
      rows,
    });
  } catch (error) {
    console.error("Error fetching teacher gradebook:", error);
    return res.status(500).json({ error: "Error al obtener la libreta de calificaciones" });
  }
};

// GET /api/grades/classroom/:classroomId/student
// Devuelve el historial personal del estudiante: sus tareas con estado y calificación
export const getStudentGradebook = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const studentId = req.user.id;

    const course = await Course.findByPk(classroomId);
    if (!course) {
      return res.status(404).json({ error: "Aula no encontrada" });
    }

    // Verificar que el estudiante esté inscrito activamente
    const enrollment = await Enrollment.findOne({
      where: { userId: studentId, courseId: classroomId, status: "active" },
    });
    if (!enrollment && course.teacherId !== studentId) {
      return res.status(403).json({ error: "No tienes acceso a este aula" });
    }

    // Obtener todas las tareas del curso
    const assignments = await Assignment.findAll({
      where: { courseId: classroomId },
      attributes: ["id", "title", "instructions", "maxScore", "dueDate"],
      order: [["createdAt", "ASC"]],
    });

    // Obtener las entregas del estudiante para estas tareas
    const submissions = await Submission.findAll({
      where: {
        assignmentId: assignments.map((a) => a.id),
        userId: studentId,
      },
      attributes: ["id", "assignmentId", "score", "status", "submissionDate", "teacherComment"],
    });

    // Indexar entregas por assignmentId
    const submissionMap = new Map();
    submissions.forEach((sub) => {
      submissionMap.set(sub.assignmentId, sub);
    });

    // Construir el historial del estudiante
    const history = assignments.map((assignment) => {
      const sub = submissionMap.get(assignment.id);
      return {
        assignmentId: assignment.id,
        title: assignment.title,
        maxScore: assignment.maxScore,
        dueDate: assignment.dueDate,
        status: sub ? sub.status : "pending",
        score: sub ? sub.score : null,
        submissionDate: sub ? sub.submissionDate : null,
        teacherComment: sub ? sub.teacherComment : null,
      };
    });

    // Calcular estadísticas
    const gradedCount = history.filter((h) => h.status === "graded" && h.score !== null).length;
    const totalGradedScore = history
      .filter((h) => h.status === "graded" && h.score !== null)
      .reduce((sum, h) => sum + h.score, 0);
    const totalMaxScore = history
      .filter((h) => h.status === "graded" && h.score !== null)
      .reduce((sum, h) => sum + h.maxScore, 0);

    return res.json({
      history,
      stats: {
        totalAssignments: assignments.length,
        submittedCount: history.filter((h) => h.status === "submitted" || h.status === "late").length,
        gradedCount,
        pendingCount: history.filter((h) => h.status === "pending").length,
        averagePercentage: totalMaxScore > 0 ? Math.round((totalGradedScore / totalMaxScore) * 100) : null,
      },
    });
  } catch (error) {
    console.error("Error fetching student gradebook:", error);
    return res.status(500).json({ error: "Error al obtener tu libreta de calificaciones" });
  }
};
