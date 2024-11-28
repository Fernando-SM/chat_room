const express = require("express");
const path = require("path");
const { registerUser, loginUser } = require("../controllers/authController");
const { createMessage, getMessages } = require("../controllers/messageController");
const upload = require("../config/upload");

const router = express.Router();

// Configurar servidor de archivos estáticos
router.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
    setHeaders: (res, filePath) => {
        const ext = path.extname(filePath).toLowerCase();

        if (ext === '.pdf') {
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline'
            });
        } else if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
            res.set('Content-Type', `image/${ext.substring(1)}`);
        } else if (['.mp4', '.webm'].includes(ext)) {
            res.set('Content-Type', `video/${ext.substring(1)}`);
        } else {
            res.set('Content-Type', 'application/octet-stream');
        }
    }
}));

// Rutas de autenticación
router.post("/auth/register", registerUser);
router.post("/auth/login", loginUser);

// Rutas de mensajes
router.get("/messages", getMessages);
router.post("/messages", createMessage);

// Ruta de carga de archivos
router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No se ha subido ningún archivo." });
    }

    // Determinar el tipo de archivo
    const ext = path.extname(req.file.originalname).toLowerCase();
    const mediaType = ['.jpg', '.jpeg', '.png', '.gif'].includes(ext) ? 'image' :
        ext === '.pdf' ? 'pdf' :
            ['.mp4', '.webm'].includes(ext) ? 'video' : 'file';

    // Responder con detalles del archivo
    res.status(201).json({
        url: `/uploads/${req.file.filename}`,
        mediaType,
        originalName: req.file.originalname,
        size: req.file.size
    });
});

module.exports = router;
