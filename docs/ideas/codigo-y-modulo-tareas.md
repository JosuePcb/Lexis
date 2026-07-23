# Refinamiento de Idea: Visibilidad de Código de Clase & Módulo de Tareas y Evaluación

## Problem Statement
¿Cómo podríamos hacer que el código de la clase sea fácilmente visible y compartible para todos los miembros, y brindar a docentes y alumnos un módulo completo para crear, enviar, evaluar y retroalimentar tareas con adjuntos?

## Recommended Direction
1. **Código de Clase Visible**:
   - Añadir un banner/badge interactivo en el Dashboard del aula virtual (accesible para Profesor y Alumnos) con botón "Copiar Código" e indicador visual de copiado.
2. **Gestión de Tareas (Docente)**:
   - Crear tareas especificando: Título, Instrucciones, Fecha/Hora Límite, Puntaje Máximo y Adjuntos (archivos subidos o URLs).
   - Vista de entregas por tarea: tabla de alumnos inscritos mostrando quién entregó, fecha de entrega, archivos cargados y estado.
   - Panel de Calificación: Asignar nota numérica (0 - puntaje_maximo) y comentario de retroalimentación.
3. **Entrega de Tareas (Estudiante)**:
   - Vista detallada de la tarea con instrucciones y archivos adjuntos del docente.
   - Formulario de entrega: Cargar archivos o enlaces externos.
   - Botón de "Marcar como entregada" / "Anular entrega" (si no ha sido calificada).

## Key Assumptions to Validate
- [ ] El backend gestiona adecuadamente la subida de archivos multipart (`multer`) almacenándolos en `/uploads` y sirviéndolos de forma estática protegida.
- [ ] La fecha de entrega se valida contra la fecha límite del servidor (evitando manipulación del cliente).
- [ ] El código de la clase es accesible en la respuesta del endpoint `GET /api/classrooms/:id` tanto para el creador (docente) como para los inscritos (estudiantes).

## MVP Scope
### En alcance (In Scope):
- Badge del `courseCode` con copia en 1 clic en la vista del aula.
- CRUD de Tareas (`POST /api/classrooms/:id/tasks`, `GET`, `PUT`, `DELETE`).
- Endpoints de Entregas (`POST /api/tasks/:id/submissions`, `GET`).
- Subida de archivos (PDF/Imágenes/Docs max 10MB) + URLs.
- Asignación de calificación numérica + comentario del docente.

### Fuera de alcance (Not Doing) en este MVP:
- Integración con almacenamiento S3 en la nube (se usará almacenamiento local en servidor).
- Re-entregas ilimitadas después de calificado (una vez calificado, queda cerrado).
- Notificaciones en tiempo real por WebSocket/Email.

## Open Questions
- ¿Deseas que al hacer clic en "Copiar código" también se proporcione la opción de copiar un enlace directo de invitación?
