import { Announcement, Comment, Course, Enrollment, User } from "../models/index.js";

// POST /api/posts
// Publica un anuncio en el muro de un aula.
// Solo el teacher del curso puede crear anuncios.
export const createAnnouncement = async (req, res) => {
  try {
    const { courseId, content } = req.body;
    const requestorId = req.user.id;

    // Valida que los campos obligatorios estén presentes
    if (!courseId || !content) {
      return res
        .status(400)
        .json({ error: { message: "courseId y content son requeridos" } });
    }

    // Busca el curso para verificar que existe
    const course = await Course.findByPk(courseId);

    if (!course) {
      return res.status(404).json({ error: { message: "Aula no encontrada" } });
    }

    // Solo el teacher del curso puede publicar anuncios
    if (requestorId !== course.teacherId) {
      return res
        .status(403)
        .json({ error: { message: "Solo el docente puede publicar anuncios" } });
    }

    // Crea el anuncio en la base de datos
    const announcement = await Announcement.create({
      courseId,
      content,
      publishedBy: requestorId,
    });

    // Devuelve el anuncio completo con los datos del publicador
    const fullAnnouncement = await Announcement.findByPk(announcement.id, {
      include: [
        { model: User, as: "publisher", attributes: ["id", "name", "email"] },
      ],
    });

    res.status(201).json(fullAnnouncement);
  } catch (error) {
    console.error("Error creating announcement:", error);
    res
      .status(500)
      .json({ error: { message: "Error al publicar el anuncio" } });
  }
};

// GET /api/posts/classroom/:classroomId
// Devuelve el muro de anuncios de un aula, ordenado del más reciente al más antiguo.
// Accesible por el teacher del curso o cualquier alumno con enrollment activo.
export const getClassroomWall = async (req, res) => {
  try {
    const classroomId = req.params.classroomId;
    const requestorId = req.user.id;

    // Busca el curso para verificar que existe
    const course = await Course.findByPk(classroomId);

    if (!course) {
      return res.status(404).json({ error: { message: "Aula no encontrada" } });
    }

    // Verifica que el requestor es teacher o tiene enrollment activo en el curso
    const isTeacher = requestorId === course.teacherId;
    if (!isTeacher) {
      const memberEnrollment = await Enrollment.findOne({
        where: { userId: requestorId, courseId: classroomId, status: "active" },
      });
      if (!memberEnrollment) {
        return res
          .status(403)
          .json({ error: { message: "No tienes acceso a este aula" } });
      }
    }

    // Busca todos los anuncios del aula con publisher y comentarios incluidos
    const announcements = await Announcement.findAll({
      where: { courseId: classroomId },
      include: [
        // Datos del docente que publicó el anuncio
        { model: User, as: "publisher", attributes: ["id", "name", "email"] },
        // Comentarios del anuncio con datos del autor de cada comentario
        {
          model: Comment,
          as: "comments",
          include: [
            { model: User, as: "user", attributes: ["id", "name", "email"] },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(announcements);
  } catch (error) {
    console.error("Error fetching classroom wall:", error);
    res
      .status(500)
      .json({ error: { message: "Error al obtener el muro del aula" } });
  }
};

// POST /api/posts/:id/comments
// Agrega un comentario a un anuncio.
// Accesible por el teacher del curso o cualquier alumno con enrollment activo.
export const createComment = async (req, res) => {
  try {
    const announcementId = req.params.id;
    const { content } = req.body;
    const requestorId = req.user.id;

    // Valida que el contenido del comentario esté presente
    if (!content) {
      return res
        .status(400)
        .json({ error: { message: "El contenido del comentario es requerido" } });
    }

    // Busca el anuncio e incluye el curso para poder verificar membresía
    const announcement = await Announcement.findByPk(announcementId, {
      include: [{ model: Course, as: "course" }],
    });

    if (!announcement) {
      return res
        .status(404)
        .json({ error: { message: "Anuncio no encontrado" } });
    }

    const courseId = announcement.courseId;
    const course = announcement.course;

    // Verifica que el requestor es teacher o tiene enrollment activo en el curso
    const isTeacher = requestorId === course.teacherId;
    if (!isTeacher) {
      const memberEnrollment = await Enrollment.findOne({
        where: { userId: requestorId, courseId, status: "active" },
      });
      if (!memberEnrollment) {
        return res
          .status(403)
          .json({ error: { message: "No tienes acceso a este aula" } });
      }
    }

    // Crea el comentario en la base de datos
    const comment = await Comment.create({
      announcementId,
      userId: requestorId,
      content,
    });

    // Devuelve el comentario completo con los datos del autor
    const fullComment = await Comment.findByPk(comment.id, {
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email"] },
      ],
    });

    res.status(201).json(fullComment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res
      .status(500)
      .json({ error: { message: "Error al crear el comentario" } });
  }
};
