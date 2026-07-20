# Comandos del Proyecto Lexis

Este documento contiene los comandos principales para el desarrollo, construcción y gestión de la base de datos del proyecto Lexis utilizando `pnpm` y `docker compose`.

---

## 🛠️ Base de Datos (Docker)

La base de datos PostgreSQL y pgAdmin se ejecutan mediante Docker Compose. Puedes gestionarlas con los siguientes scripts de la raíz del proyecto:

### Iniciar Base de Datos (Modo Background)
Levanta los contenedores de PostgreSQL y pgAdmin en segundo plano.
```bash
pnpm db:up
```
*(O directamente con `docker compose up -d`)*

### Apagar Base de Datos
Detiene y apaga los contenedores activos de la base de datos sin borrar los datos persistidos.
```bash
pnpm db:down
```
*(O directamente con `docker compose down`)*

### Reiniciar y Resetear Base de Datos
Apaga los contenedores, **elimina los volúmenes persistentes** (resetea los datos a cero) y los vuelve a levantar.
```bash
pnpm db:reset
```
*(O directamente con `docker compose down -v && docker compose up -d`)*

### Ver Logs de la Base de Datos
Muestra y sigue los logs en tiempo real emitidos por el contenedor de PostgreSQL.
```bash
pnpm db:logs
```

---

## 💻 Desarrollo

Los siguientes comandos se ejecutan desde la raíz del proyecto y gestionan las dependencias del workspace.

### Iniciar Entorno de Desarrollo Completo
Ejecuta el servidor de desarrollo del Frontend y el Backend simultáneamente en paralelo utilizando `concurrently`.
```bash
pnpm dev
```

### Iniciar Solo Frontend
Levanta únicamente el servidor de desarrollo de Vite para el Frontend.
```bash
pnpm dev:frontend
```

### Iniciar Solo Backend
Levanta únicamente el servidor de desarrollo del Backend con Node.js en modo observación (`--watch`).
```bash
pnpm dev:backend
```

---

## 📦 Producción y Calidad

### Compilar Frontend
Construye el bundle optimizado para producción de la aplicación Frontend en la carpeta `Frontend/dist`.
```bash
pnpm build
```

### Verificar Código (Linter)
Ejecuta ESLint sobre el proyecto Frontend para comprobar y validar las reglas de código.
```bash
pnpm lint
```

---

## 🗄️ Migraciones y Semillas (Backend)

Si necesitas ejecutar migraciones de Sequelize directamente en el Backend, primero entra a la carpeta del Backend o ejecútalos a través de pnpm:

* **Ejecutar migraciones**: `pnpm -F backend db:migrate`
* **Deshacer última migración**: `pnpm -F backend db:migrate:undo`
* **Ejecutar semillas**: `pnpm -F backend db:seed`
* **Deshacer semillas**: `pnpm -F backend db:seed:undo`
