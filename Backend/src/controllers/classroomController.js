import crypto from "crypto";
import { Course, Enrollment, User } from "../models/index.js";

// Genera un código único de 6 caracteres hex (ej: A1B2C3) usando crypto.randomBytes
const generateCourseCode = () => {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
};

// GET /api/classrooms
// Devuelve las aulas del usuario actual.
// Si es teacher → sus cursos creados. Si es student → sus cursos inscritos (enrollment activo).
export const getClassrooms = async (req, res) => {
  try {
    const { id, role } = req.user;

    let classrooms;

    if (role === "teacher") {
      // Busca todos los cursos donde el usuario es el docente
      classrooms = await Course.findAll({
        where: { teacherId: id },
        include: [
          { model: User, as: "teacher", attributes: ["id", "name", "email"] },
        ],
        order: [["createdAt", "DESC"]],
      });
    } else {
      // Para estudiantes: busca sus inscripciones activas y extrae el curso de cada una
      const enrollments = await Enrollment.findAll({
        where: { userId: id, status: "active" },
        include: [
          {
            model: Course,
            include: [
              { model: User, as: "teacher", attributes: ["id", "name", "email"] },
            ],
          },
        ],
      });
      classrooms = enrollments.map((e) => e.Course);
    }

    res.json(classrooms);
  } catch (error) {
    console.error("Error fetching classrooms:", error);
    res.status(500).json({ error: { message: "Error al obtener las aulas" } });
  }
};

// POST /api/classrooms
// Crea un nuevo aula. Solo accesible para teachers.
// Genera un courseCode único, crea el Course y auto-inscribe al docente como primer miembro.
export const createClassroom = async (req, res) => {
  try {
    const { name, section, description } = req.body;
    const teacherId = req.user.id;

    if (!name) {
      return res.status(400).json({ error: { message: "El nombre del aula es requerido" } });
    }

    // Genera códigos hasta encontrar uno que no exista en la base de datos
    let courseCode;
    let isUnique = false;

    while (!isUnique) {
      courseCode = generateCourseCode();
      const existing = await Course.findOne({ where: { courseCode } });
      if (!existing) isUnique = true;
    }

    // Crea el curso en la base de datos
    const course = await Course.create({
      name,
      section: section || null,
      description: description || null,
      courseCode,
      teacherId,
    });

    // Auto-inscribe al docente como miembro activo del aula
    await Enrollment.create({
      userId: teacherId,
      courseId: course.id,
      status: "active",
    });

    // Devuelve el curso completo con los datos del docente incluidos
    const fullCourse = await Course.findByPk(course.id, {
      include: [
        { model: User, as: "teacher", attributes: ["id", "name", "email"] },
      ],
    });

    res.status(201).json(fullCourse);
  } catch (error) {
    console.error("Error creating classroom:", error);
    res.status(500).json({ error: { message: "Error al crear el aula" } });
  }
};

// POST /api/classrooms/join
// Permite a un estudiante unirse a un aula usando el courseCode de 6 caracteres.
// Valida que el código exista, que el estudiante no esté ya inscrito, y crea el enrollment.
export const joinClassroom = async (req, res) => {
  try {
    const { courseCode } = req.body;
    const studentId = req.user.id;

    if (!courseCode) {
      return res.status(400).json({ error: { message: "El código del aula es requerido" } });
    }

    // Normaliza a mayúsculas y busca el curso por código
    const course = await Course.findOne({ where: { courseCode: courseCode.toUpperCase() } });

    if (!course) {
      return res.status(404).json({ error: { message: "No se encontró un aula con ese código" } });
    }

    // Busca cualquier enrollment existente (sin filtrar por status) para manejar re-inscripción
    const existingEnrollment = await Enrollment.findOne({
      where: { userId: studentId, courseId: course.id },
    });

    if (existingEnrollment) {
      if (existingEnrollment.status === "active") {
        // El estudiante ya está inscrito activamente
        return res.status(409).json({ error: { message: "Ya estás inscrito en este aula" } });
      } else {
        // El estudiante fue expulsado anteriormente → reactivar su inscripción
        existingEnrollment.status = "active";
        await existingEnrollment.save();
      }
    } else {
      // No existe enrollment previo → crear uno nuevo
      await Enrollment.create({
        userId: studentId,
        courseId: course.id,
        status: "active",
      });
    }

    // Devuelve el curso completo con los datos del docente
    const fullCourse = await Course.findByPk(course.id, {
      include: [
        { model: User, as: "teacher", attributes: ["id", "name", "email"] },
      ],
    });

    res.status(201).json(fullCourse);
  } catch (error) {
    console.error("Error joining classroom:", error);
    res.status(500).json({ error: { message: "Error al unirse al aula" } });
  }
};



// GET /api/classrooms/:id
// Devuelve la información detallada de un aula si el usuario es docente del curso o tiene un enrollment activo.
export const getClassroomById = async (req, res) => {
  try {
    const { id: courseId } = req.params;
    const userId = req.user.id;

    const course = await Course.findByPk(courseId, {
      include: [
        { model: User, as: "teacher", attributes: ["id", "name", "email"] },
      ],
    });

    if (!course) {
      return res.status(404).json({ error: { message: "Aula no encontrada" } });
    }

    const isTeacher = course.teacherId === userId;
    if (!isTeacher) {
      const activeEnrollment = await Enrollment.findOne({
        where: { userId, courseId, status: "active" },
      });
      if (!activeEnrollment) {
        return res.status(403).json({ error: { message: "No tienes acceso a este aula" } });
      }
    }

    res.json(course);
  } catch (error) {
    console.error("Error fetching classroom by id:", error);
    res.status(500).json({ error: { message: "Error al obtener la información del aula" } });
  }
};

export const updateClassroom = async (req, res) => {
  res.status(501).json({ message: "Update classroom not implemented yet" });
};

// GET /api/classrooms/:id/students
// Devuelve la lista de alumnos activos del aula (excluye al teacher).
// Accesible por el teacher del curso o cualquier alumno con enrollment activo.
export const getClassroomStudents = async (req, res) => {
  try {
    const courseId = req.params.id;
    const requestorId = req.user.id;

    // Busca el curso para verificar que existe
    const course = await Course.findByPk(courseId, {
      include: [{ model: User, as: "teacher", attributes: ["id", "name", "email"] }],
    });

    if (!course) {
      return res.status(404).json({ error: { message: "Aula no encontrada" } });
    }

    // Verifica que el requestor es teacher o tiene enrollment activo en el curso
    const isTeacher = requestorId === course.teacherId;
    if (!isTeacher) {
      const memberEnrollment = await Enrollment.findOne({
        where: { userId: requestorId, courseId, status: "active" },
      });
      if (!memberEnrollment) {
        return res.status(403).json({ error: { message: "No tienes acceso a este aula" } });
      }
    }

    // Busca todos los enrollments activos, excluyendo al teacher del curso
    const enrollments = await Enrollment.findAll({
      where: { courseId, status: "active" },
      include: [
        { model: User, attributes: ["id", "name", "email"] },
      ],
    });

    // Filtra al teacher y mapea a formato de respuesta con datos del alumno y del enrollment
    const students = enrollments
      .filter((e) => e.userId !== course.teacherId)
      .map((e) => ({
        id: e.User.id,
        name: e.User.name,
        email: e.User.email,
        enrollmentDate: e.enrollmentDate,
        enrollmentId: e.id,
      }));

    res.json(students);
  } catch (error) {
    console.error("Error fetching classroom students:", error);
    res.status(500).json({ error: { message: "Error al obtener los alumnos del aula" } });
  }
};

// DELETE /api/classrooms/:id/students/:studentId
// Expulsa a un alumno del aula (soft delete: cambia status a 'removed').
// Solo el teacher del curso puede ejecutar esta acción.
export const kickStudent = async (req, res) => {
  try {
    const courseId = req.params.id;
    const studentId = parseInt(req.params.studentId, 10);
    const requestorId = req.user.id;

    // Busca el curso para validar existencia y permisos
    const course = await Course.findByPk(courseId);

    if (!course) {
      return res.status(404).json({ error: { message: "Aula no encontrada" } });
    }

    // Solo el teacher del curso puede expulsar alumnos
    if (requestorId !== course.teacherId) {
      return res.status(403).json({ error: { message: "Solo el docente puede expulsar alumnos" } });
    }

    // Previene que el teacher se expulse a sí mismo
    if (studentId === course.teacherId) {
      return res.status(400).json({ error: { message: "No puedes expulsarte a ti mismo" } });
    }

    // Busca el enrollment activo del alumno en este curso
    const enrollment = await Enrollment.findOne({
      where: { userId: studentId, courseId, status: "active" },
    });

    if (!enrollment) {
      return res.status(404).json({ error: { message: "El alumno no está inscrito en este aula" } });
    }

    // Soft delete: marca el enrollment como 'removed' en lugar de eliminarlo
    enrollment.status = "removed";
    await enrollment.save();

    res.json({ message: "Alumno expulsado del aula exitosamente" });
  } catch (error) {
    console.error("Error kicking student:", error);
    res.status(500).json({ error: { message: "Error al expulsar al alumno" } });
  }
};
