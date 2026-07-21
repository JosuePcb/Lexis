# Requisitos Funcionales

### Nivel de usuarios
- [x] Registro e inicio de sesion de usuarios.
- [ ] Perfiles de usuario, permitir editar informacion basica.

### Gestion de Aulas Virtuales
- [X] **Creacion de clases**. Se debe poder crear aulas virtuales asignando nombre, seccion y descripcion. 
- [ ] Se debe poder **editar** la informacion sobre el aula virtual.
- [X] El aula debe crear un **codigo unico** por clase, para que los estudiantes puedan unirse de forma manual.
- [ ] Panel que muestre los alumnos inscritos, con opcion de expulsar usuarios.

### Publicacion y gestion de contenido 
- [ ] Permitir subir novedades al docente en un muro y que los estudiantes puedan comentar.

### Modulo de tareas y evaluacion
- [ ] El docente debe poder crear tareas especificando:
    - TItulo
    - Instrucciones
    - Fecha/hora del limite de entrega
    - Puntaje maximo
    - Adjuntar archivos
- [ ] El estudiante debe poder cargar archivos (Enlaces, Documentos o imagenes) para cumplir con la tarea y marcarla entregada.

- [ ] **Retroalimentacion:** 
    - El docente debe poder visualizar los archivos entregados por cada alumno.
    - El docente debe poder asignar calificacion numerica.

### Libreta de calificaciones

- [ ] Vista del Docente: Una tabla centralizada donde se muestran todos los alumnos de la clase en las filas y todas las tareas con sus respectivas calificaciones.

- [ ] Vista del Estudiante: Un panel individual donde el alumno ve únicamente su historial de tareas entregadas, pendientes, calificadas.

# Requisitos No Funcionales
- [x] Autorización Estricta. El backend debe validar que el token de sesión (JWT) tenga los permisos adecuados antes de permitir cualquier operación.
- [X] Diseño Responsivo. La interfaz de usuario debe ser 100% responsiva, adaptándose perfectamente a dispositivos móviles.

# Generación de Código de Aula

Cuando un docente crea un aula, el sistema genera automáticamente un **código único de 6 caracteres** (hexadecimal, Mayúsculas) que los estudiantes necesitan para unirse.

**Flujo:**

1. El docente envía `POST /api/classrooms` con `name` (requerido), `section` y `description` (opcionales).
2. El backend genera un código aleatorio de 6 caracteres hex (`A0-F2C1` por ejemplo) usando `crypto.randomBytes(3)`.
3. Se verifica que el código sea único consultando la tabla `Courses`. Si ya existe, se genera otro hasta encontrar uno disponible.
4. Se crea el `Course` con el código asignado y se inscribe automáticamente al docente como primer miembro (`Enrollment`).
5. El código se devuelve en la respuesta y se muestra al docente en el modal de creación.

**Unión de estudiantes:**

1. El estudiante introduce el código de 6 caracteres en el modal "Unirse a un Aula".
2. El backend normaliza el código a mayúsculas y busca un `Course` con ese `courseCode`.
3. Si no existe → error `404`. Si el estudiante ya está inscrito → error `409`.
4. Si es válido, se crea el `Enrollment` y se devuelve la información del aula.