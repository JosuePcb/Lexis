import multer from "multer";
import path from "path";
import fs from "fs";

// Asegura que la carpeta uploads exista
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento en disco
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const sanitizedBase = baseName.replace(/[^a-zA-Z0-9_\-]/g, "_");
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${sanitizedBase}-${uniqueSuffix}${ext}`);
  },
});

// Filtro de extensiones permitidas (pdf, doc, docx, txt, zip, png, jpg, jpeg)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /\.(pdf|doc|docx|txt|zip|png|jpg|jpeg)$/i;
  if (!file.originalname.match(allowedExtensions)) {
    return cb(new Error("Tipo de archivo no permitido. Solo se aceptan PDF, DOC, DOCX, TXT, ZIP, PNG, JPG."), false);
  }
  cb(null, true);
};

// Instancia de Multer con límite de 10MB por archivo
export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
});

// Middleware helper para capturar errores de Multer (ej: límite de tamaño)
export const handleUpload = (multerMiddleware) => {
  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: "El archivo excede el límite máximo permitido (10MB)" });
        }
        return res.status(400).json({ error: `Error en la carga de archivos: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  };
};

export default upload;
