# Requisitos Funcionales

### Nivel de usuarios
- [ ] Registro e inicio de sesion de usuarios.
- [ ] Perfiles de usuario, permitir editar informacion basica.

### Gestion de Aulas Virtuales
- [ ] **Creacion de clases**. Se debe poder crear aulas virtuales asignando nombre, seccion y descripcion. 
- [ ] Se debe poder **editar** la informacion sobre el aula virtual.
- [ ] El aula debe crear un **codigo unico** por clase, para que los estudiantes puedan unirse de forma manual.
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
    - El estudiante y el docente deben tener una seccion de comentarios privados para la retroalimentacion sobre la evaluacion.

### Libreta de calificaciones

- [ ] Vista del Docente: Una tabla centralizada donde se muestran todos los alumnos de la clase en las filas y todas las tareas con sus respectivas calificaciones.

- [ ] Vista del Estudiante: Un panel individual donde el alumno ve únicamente su historial de tareas entregadas, pendientes, calificadas.

# Requisitos No Funcionales
- [ ] Autorización Estricta. El backend debe validar que el token de sesión (JWT) tenga los permisos adecuados antes de permitir cualquier operación.
- [ ] Diseño Responsivo. La interfaz de usuario debe ser 100% responsiva, adaptándose perfectamente a dispositivos móviles.