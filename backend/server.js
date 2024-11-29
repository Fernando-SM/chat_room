const http = require("http");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDatabase = require("./config/database");
const { Server } = require("socket.io");
const Message = require("./models/Message");
const routes = require("./routes/routes");

dotenv.config(); // Carga las variables de entorno desde el archivo .env
connectDatabase(); // Conexión a MongoDB

const app = express();

// Configuración de archivos estáticos
app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"), {
        setHeaders: (res, filePath) => {
            const ext = path.extname(filePath).toLowerCase();
            if (ext === ".pdf") {
                res.set({
                    "Content-Type": "application/pdf",
                    "Content-Disposition": "inline",
                });
            } else if ([".jpg", ".jpeg", ".png", ".gif"].includes(ext)) {
                res.set("Content-Type", `image/${ext.substring(1)}`);
            } else if ([".mp4", ".webm"].includes(ext)) {
                res.set("Content-Type", `video/${ext.substring(1)}`);
            }
        },
    })
);

// Middleware
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "*", // Permitir origen desde FRONTEND_URL o todos los orígenes
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Authorization", "Content-Type"],
        credentials: true,
    })
);
app.use(express.json());

// Rutas
app.use("/api", routes);

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ message: "Ruta no encontrada" });
});

// Manejo de errores globales
app.use((err, req, res, next) => {
    console.error("Error global:", err.stack || err.message);
    if (!res.headersSent) {
        res.status(500).json({ message: "Error interno del servidor", error: err.message });
    } else {
        next(err);
    }
});

// Servidor HTTP
const server = http.createServer(app);

// Configuración de Socket.IO
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "*", // Permitir conexión desde FRONTEND_URL o todos los orígenes
        methods: ["GET", "POST"],
    },
});

// Middleware para Socket.IO
app.use((req, res, next) => {
    req.io = io; // Agregar la instancia de Socket.IO a `req`
    next();
});

// Gestión de usuarios escribiendo
const typingUsers = {};

io.on("connection", (socket) => {
    console.log(`Usuario conectado: ${socket.id}`);

    // Escuchar mensajes
    socket.on("message", async (data) => {
        console.log("Mensaje recibido:", data);
        try {
            const newMessage = new Message({
                author: data.author,
                content: data.content,
                timestamp: data.timestamp,
                media: data.media,
                mediaType: data.mediaType,
            });
            await newMessage.save();
            io.emit("message", {
                ...newMessage._doc,
                media: newMessage.media
                    ? `${process.env.BASE_URL}${newMessage.media}`
                    : null,
            });

            // Detener escritura si el usuario está escribiendo
            if (typingUsers[socket.id]) {
                delete typingUsers[socket.id];
                socket.broadcast.emit("stopTyping", data.author);
            }
        } catch (error) {
            console.error("Error al guardar mensaje:", error.message);
        }
    });

    // Usuario escribiendo
    socket.on("typing", (username) => {
        if (username) {
            typingUsers[socket.id] = username;
            socket.broadcast.emit("typing", username);
        }
    });

    // Usuario deja de escribir
    socket.on("stopTyping", () => {
        const username = typingUsers[socket.id];
        if (username) {
            delete typingUsers[socket.id];
            socket.broadcast.emit("stopTyping", username);
        }
    });

    // Usuario desconectado
    socket.on("disconnect", () => {
        const username = typingUsers[socket.id];
        if (username) {
            delete typingUsers[socket.id];
            socket.broadcast.emit("stopTyping", username);
        }
        console.log(`Usuario desconectado: ${socket.id}`);
    });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
