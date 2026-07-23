import { Assignment, AssignmentAttachment, Submission, SubmissionFile, Course, Enrollment, User } from "../models/index.js";

// Helper para parsear enlaces desde el body (soporta string JSON o array)
const parseLinks = (linksRaw) => {
  if (!linksRaw) return [];
  if (Array.isArray(linksRaw)) return linksRaw.filter(Boolean);
  if (typeof linksRaw === "string") {
    try {
      const parsed = JSON.parse(linksRaw);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch (e) {
      return [linksRaw].filter(Boolean);
    }
  }
  return [];
};

// -------------------------------------------------------------
// POST /api/tasks — Crear Tarea (Solo Teacher del curso)
// -------------------------------------------------------------
export const createTask = async (req, res) => {
  try {
    const { courseId, title, instructions, description, dueDate, maxScore } = req.body;
    const teacherId = req.user.id;

    if (!courseId || !title || !dueDate || maxScore === undefined) {
      return res.status(400).json({ error: "courseId, title, dueDate y maxScore son obligatorios" });
    }

    const numericMaxScore = Number(maxScore);
    if (isNaN(numericMaxScore) || numericMaxScore <= 0) {
      return res.status(400).json({ error: "maxScore debe ser un número mayor a 0" });
    }

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ error: "Aula no encontrada" });
    }

    if (course.teacherId !== teacherId) {
      return res.status(403).json({ error: "Solo el docente del aula puede crear tareas" });
    }

    const assignment = await Assignment.create({
      courseId,
      title: title.trim(),
      instructions: (instructions || description || "").trim(),
      dueDate: new Date(dueDate),
      maxScore: numericMaxScore,
    });

    // Guardar adjuntos de tipo enlace
    const links = parseLinks(req.body.links);
    for (const linkUrl of links) {
      if (typeof linkUrl === "string" && linkUrl.trim()) {
        await AssignmentAttachment.create({
          assignmentId: assignment.id,
          type: "link",
          url: linkUrl.trim(),
        });
      }
    }

    // Guardar adjuntos de tipo archivo (subidos por Multer)
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        await AssignmentAttachment.create({
          assignmentId: assignment.id,
          type: "file",
          url: `/uploads/${file.filename}`,
        });
      }
    }

    const createdTask = await Assignment.findByPk(assignment.id, {
      include: [{ model: AssignmentAttachment, as: "attachments" }],
    });

    return res.status(201).json(createdTask);
  } catch (error) {
    console.error("Error creating task:", error);
    return res.status(500).json({ error: "Error al crear la tarea" });
  }
};

// -------------------------------------------------------------
// GET /api/tasks/course/:courseId — Obtener tareas de un curso
// -------------------------------------------------------------
export const getTasksByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ error: "Aula no encontrada" });
    }

    // Verificar permisos
    const isTeacher = course.teacherId === userId;
    if (!isTeacher) {
      const activeEnrollment = await Enrollment.findOne({
        where: { userId, courseId, status: "active" },
      });
      if (!activeEnrollment) {
        return res.status(403).json({ error: "No tienes acceso a las tareas de este aula" });
      }
    }

    const assignments = await Assignment.findAll({
      where: { courseId },
      include: [{ model: AssignmentAttachment, as: "attachments" }],
      order: [["createdAt", "DESC"]],
    });

    // Si es estudiante, adjuntar estado de entrega del alumno para cada tarea
    if (role === "student" || !isTeacher) {
      const tasksWithStatus = await Promise.all(
        assignments.map(async (task) => {
          const taskJson = task.toJSON();
          const submission = await Submission.findOne({
            where: { assignmentId: task.id, userId },
            include: [{ model: SubmissionFile, as: "files" }],
          });

          if (submission) {
            taskJson.mySubmission = submission;
            taskJson.status = submission.status; // 'submitted', 'late', 'graded'
            taskJson.score = submission.score;
          } else {
            taskJson.mySubmission = null;
            taskJson.status = "pending";
            taskJson.score = null;
          }
          return taskJson;
        })
      );
      return res.json(tasksWithStatus);
    }

    return res.json(assignments);
  } catch (error) {
    console.error("Error fetching course tasks:", error);
    return res.status(500).json({ error: "Error al obtener las tareas" });
  }
};

// -------------------------------------------------------------
// GET /api/tasks/:id — Obtener detalle de una tarea
// -------------------------------------------------------------
export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const assignment = await Assignment.findByPk(id, {
      include: [
        { model: AssignmentAttachment, as: "attachments" },
        { model: Course, as: "course" },
      ],
    });

    if (!assignment) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }

    const course = assignment.course;
    const isTeacher = course && course.teacherId === userId;

    if (!isTeacher) {
      const activeEnrollment = await Enrollment.findOne({
        where: { userId, courseId: assignment.courseId, status: "active" },
      });
      if (!activeEnrollment) {
        return res.status(403).json({ error: "No tienes acceso a esta tarea" });
      }
    }

    const taskJson = assignment.toJSON();

    if (req.user.role === "student" || !isTeacher) {
      const submission = await Submission.findOne({
        where: { assignmentId: assignment.id, userId },
        include: [{ model: SubmissionFile, as: "files" }],
      });

      if (submission) {
        taskJson.mySubmission = submission;
        taskJson.status = submission.status;
        taskJson.score = submission.score;
      } else {
        taskJson.mySubmission = null;
        taskJson.status = "pending";
        taskJson.score = null;
      }
    }

    return res.json(taskJson);
  } catch (error) {
    console.error("Error fetching task by id:", error);
    return res.status(500).json({ error: "Error al obtener la tarea" });
  }
};

// -------------------------------------------------------------
// PUT /api/tasks/:id — Actualizar tarea (Solo Teacher)
// -------------------------------------------------------------
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;
    const { title, instructions, description, dueDate, maxScore } = req.body;

    const assignment = await Assignment.findByPk(id, {
      include: [{ model: Course, as: "course" }],
    });

    if (!assignment) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }

    if (assignment.course.teacherId !== teacherId) {
      return res.status(403).json({ error: "Solo el docente del aula puede editar la tarea" });
    }

    if (title !== undefined) assignment.title = title.trim();
    if (instructions !== undefined || description !== undefined) {
      assignment.instructions = (instructions || description || "").trim();
    }
    if (dueDate !== undefined) assignment.dueDate = new Date(dueDate);
    if (maxScore !== undefined) {
      const numericMaxScore = Number(maxScore);
      if (isNaN(numericMaxScore) || numericMaxScore <= 0) {
        return res.status(400).json({ error: "maxScore debe ser un número mayor a 0" });
      }
      assignment.maxScore = numericMaxScore;
    }

    await assignment.save();

    const updatedTask = await Assignment.findByPk(id, {
      include: [{ model: AssignmentAttachment, as: "attachments" }],
    });

    return res.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return res.status(500).json({ error: "Error al actualizar la tarea" });
  }
};

// -------------------------------------------------------------
// DELETE /api/tasks/:id — Eliminar tarea (Solo Teacher)
// -------------------------------------------------------------
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;

    const assignment = await Assignment.findByPk(id, {
      include: [{ model: Course, as: "course" }],
    });

    if (!assignment) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }

    if (assignment.course.teacherId !== teacherId) {
      return res.status(403).json({ error: "Solo el docente del aula puede eliminar la tarea" });
    }

    // Eliminar adjuntos de tarea
    await AssignmentAttachment.destroy({ where: { assignmentId: id } });

    // Eliminar archivos de entregas y entregas asociadas
    const submissions = await Submission.findAll({ where: { assignmentId: id } });
    for (const sub of submissions) {
      await SubmissionFile.destroy({ where: { submissionId: sub.id } });
      await sub.destroy();
    }

    await assignment.destroy();

    return res.json({ message: "Tarea eliminada exitosamente" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return res.status(500).json({ error: "Error al eliminar la tarea" });
  }
};

// -------------------------------------------------------------
// POST /api/tasks/:id/submit — Entregar tarea (Estudiante)
// -------------------------------------------------------------
export const submitTask = async (req, res) => {
  try {
    const { id: assignmentId } = req.params;
    const studentId = req.user.id;

    const assignment = await Assignment.findByPk(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }

    const activeEnrollment = await Enrollment.findOne({
      where: { userId: studentId, courseId: assignment.courseId, status: "active" },
    });
    if (!activeEnrollment) {
      return res.status(403).json({ error: "No estás inscrito activamente en este aula" });
    }

    let submission = await Submission.findOne({
      where: { assignmentId, userId: studentId },
    });

    if (submission && submission.status === "graded") {
      return res.status(400).json({ error: "No se puede modificar una entrega que ya ha sido calificada" });
    }

    // Cálculo de retraso basado en la fecha del servidor vs dueDate de la tarea
    const now = new Date();
    const isLate = now > new Date(assignment.dueDate);
    const newStatus = isLate ? "late" : "submitted";

    if (submission) {
      submission.status = newStatus;
      submission.submissionDate = now;
      await submission.save();
      // Limpiar archivos/links anteriores de la entrega para reemplazar con la nueva
      await SubmissionFile.destroy({ where: { submissionId: submission.id } });
    } else {
      submission = await Submission.create({
        assignmentId,
        userId: studentId,
        status: newStatus,
        submissionDate: now,
      });
    }

    // Guardar enlaces
    const links = parseLinks(req.body.links);
    for (const linkUrl of links) {
      if (typeof linkUrl === "string" && linkUrl.trim()) {
        await SubmissionFile.create({
          submissionId: submission.id,
          type: "link",
          url: linkUrl.trim(),
        });
      }
    }

    // Guardar archivos subidos
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        await SubmissionFile.create({
          submissionId: submission.id,
          type: "file",
          url: `/uploads/${file.filename}`,
        });
      }
    }

    const updatedSubmission = await Submission.findByPk(submission.id, {
      include: [{ model: SubmissionFile, as: "files" }],
    });

    return res.status(200).json(updatedSubmission);
  } catch (error) {
    console.error("Error submitting task:", error);
    return res.status(500).json({ error: "Error al realizar la entrega" });
  }
};

// -------------------------------------------------------------
// POST /api/tasks/:id/unsubmit — Anular entrega (Estudiante)
// -------------------------------------------------------------
export const unsubmitTask = async (req, res) => {
  try {
    const { id: assignmentId } = req.params;
    const studentId = req.user.id;

    const submission = await Submission.findOne({
      where: { assignmentId, userId: studentId },
    });

    if (!submission || submission.status === "pending") {
      return res.status(400).json({ error: "No existe una entrega activa para anular" });
    }

    if (submission.status === "graded") {
      return res.status(400).json({ error: "No se puede anular una entrega que ya ha sido calificada" });
    }

    // Cambiar estado a pending y eliminar los archivos entregados
    submission.status = "pending";
    await submission.save();
    await SubmissionFile.destroy({ where: { submissionId: submission.id } });

    return res.status(200).json({ message: "Entrega anulada con éxito", submission });
  } catch (error) {
    console.error("Error unsubmitting task:", error);
    return res.status(500).json({ error: "Error al anular la entrega" });
  }
};

// -------------------------------------------------------------
// GET /api/tasks/:id/submissions — Listar entregas de una tarea (Teacher)
// -------------------------------------------------------------
export const getSubmissions = async (req, res) => {
  try {
    const { id: assignmentId } = req.params;
    const teacherId = req.user.id;

    const assignment = await Assignment.findByPk(assignmentId, {
      include: [{ model: Course, as: "course" }],
    });

    if (!assignment) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }

    if (assignment.course.teacherId !== teacherId) {
      return res.status(403).json({ error: "Solo el docente del aula puede ver las entregas" });
    }

    // Buscar todos los estudiantes inscritos activamente
    const enrollments = await Enrollment.findAll({
      where: { courseId: assignment.courseId, status: "active" },
      include: [{ model: User, attributes: ["id", "name", "email"] }],
    });

    const students = enrollments
      .filter((e) => e.userId !== assignment.course.teacherId)
      .map((e) => e.User);

    // Buscar todas las entregas existentes para esta tarea
    const submissions = await Submission.findAll({
      where: { assignmentId },
      include: [
        { model: User, as: "student", attributes: ["id", "name", "email"] },
        { model: SubmissionFile, as: "files" },
      ],
    });

    // Mapear cada estudiante inscrito a su registro de entrega
    const submissionMap = new Map();
    submissions.forEach((sub) => {
      submissionMap.set(sub.userId, sub);
    });

    const result = students.map((student) => {
      const sub = submissionMap.get(student.id);
      if (sub) {
        return sub;
      }
      return {
        id: null,
        assignmentId,
        userId: student.id,
        status: "pending",
        submissionDate: null,
        score: null,
        teacherComment: null,
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
        },
        files: [],
      };
    });

    return res.json(result);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return res.status(500).json({ error: "Error al obtener las entregas" });
  }
};

// -------------------------------------------------------------
// POST / PUT /api/tasks/submissions/:submissionId/grade — Calificar entrega (Teacher)
// -------------------------------------------------------------
export const gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { score, comment, teacherComment } = req.body;
    const teacherId = req.user.id;

    if (score === undefined || score === null) {
      return res.status(400).json({ error: "La nota es requerida" });
    }

    const numericScore = Number(score);
    if (isNaN(numericScore)) {
      return res.status(400).json({ error: "La nota debe ser un valor numérico" });
    }

    let submission = await Submission.findByPk(submissionId, {
      include: [
        {
          model: Assignment,
          as: "assignment",
          include: [{ model: Course, as: "course" }],
        },
        { model: User, as: "student", attributes: ["id", "name", "email"] },
        { model: SubmissionFile, as: "files" },
      ],
    });

    if (!submission) {
      return res.status(404).json({ error: "Entrega no encontrada" });
    }

    const maxScore = submission.assignment.maxScore;

    // Validación de límites de la nota (0 <= score <= maxScore)
    if (numericScore < 0 || numericScore > maxScore) {
      return res.status(400).json({ error: `La nota debe estar entre 0 y ${maxScore}` });
    }

    if (submission.assignment.course.teacherId !== teacherId) {
      return res.status(403).json({ error: "Solo el docente del aula puede calificar las entregas" });
    }

    submission.score = numericScore;
    submission.teacherComment = (comment !== undefined ? comment : teacherComment || "").trim();
    submission.status = "graded";
    await submission.save();

    return res.status(200).json(submission);
  } catch (error) {
    console.error("Error grading submission:", error);
    return res.status(500).json({ error: "Error al calificar la entrega" });
  }
};
