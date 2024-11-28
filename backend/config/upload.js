const multer = require("multer");
const path = require("path");

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`);
    },
});

// Filtro de archivo para identificar si es previsualizable
const fileFilter = (req, file, cb) => {
    const previewableTypes = [
        "image/jpeg",
        "image/png",
        "application/pdf",
        "video/mp4",
        "video/webm",
    ];

    // Marcar el archivo como previsualizable o no
    req.isPreviewable = previewableTypes.includes(file.mimetype);

    cb(null, true); // Permitir todos los archivos
};

// Configuración de multer
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 1024 * 1024 * 50 }, // Tamaño máximo 50MB
});

module.exports = upload;
