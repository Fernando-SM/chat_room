const Message = require("../models/Message");
const {body, validationResult} = require("express-validator");

// Obtener todos los mensajes
exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.find().sort({timestamp: 1});
        const baseUrl = process.env.BASE_URL;

        // Formatear mensajes para incluir la URL completa
        const formattedMessages = messages.map(msg => ({
            ...msg._doc,
            media: msg.media ? `${baseUrl}${msg.media}` : null,
        }));

        res.status(200).json(formattedMessages);
    } catch (error) {
        res.status(500).json({message: "Error al obtener mensajes", error: error.message});
    }
};


exports.createMessage = async (req, res, next) => {
    try {
        const messageData = {
            author: req.body.author,
            content: req.body.content || "",
            timestamp: new Date(),
        };

        // Asignar media y mediaType
        if (req.file) {
            const fileExt = req.file.originalname.split(".").pop().toLowerCase();
            messageData.media = `/uploads/${req.file.filename}`;
            messageData.mediaType = ["jpg", "jpeg", "png", "gif"].includes(fileExt)
                ? "image"
                : ["mp4", "webm"].includes(fileExt)
                    ? "video"
                    : fileExt === "pdf"
                        ? "pdf"
                        : "file";
        }

        // Guardar en la base de datos
        const message = new Message(messageData);
        await message.save();

        // Emitir mensaje usando Socket.IO
        req.io.emit("message", {
            ...message._doc,
            media: message.media ? `${process.env.BASE_URL}${message.media}` : null,
        });

        // Responder al cliente
        res.status(201).json({
            ...message._doc,
            media: message.media ? `${process.env.BASE_URL}${message.media}` : null,
        });
    } catch (error) {
        console.error("Error al crear mensaje:", error);
        next(error);
    }
};
;


// Validación de mensajes (opcional)
exports.validateMessage = (req, res, next) => {
    const validationMiddleware = [
        body("author").notEmpty().withMessage("El autor es obligatorio"),
        body("content")
            .optional()
            .isString()
            .withMessage("El contenido debe ser texto."),
        body("mediaType")
            .optional()
            .isIn(["image", "file", null])
            .withMessage("El tipo de archivo debe ser 'image', 'file' o null."),
    ];

    validationMiddleware.forEach((middleware) => middleware(req, res, next));
};