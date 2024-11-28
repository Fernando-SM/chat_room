import { io } from "socket.io-client";

const socket = io(`${process.env.VUE_APP_SOCKET_URL}`, {
    reconnection: true, // Reconexión automática
    reconnectionAttempts: 5, // Intentos máximos de reconexión
    reconnectionDelay: 2000, // Tiempo entre intentos (en ms)
    autoConnect: false, // Evitar la conexión automática
});

// Métodos manuales de conexión y desconexión
export const connectSocket = () => {
    if (!socket.connected) {
        console.log("Conectando al socket...");
        socket.connect();
    }
};

export const disconnectSocket = () => {
    if (socket.connected) {
        console.log("Desconectando del socket...");
        socket.disconnect();
    }
};

// Escuchar eventos básicos
socket.on("connect", () => {
    console.log("Conectado a Socket.IO");
});

socket.on("disconnect", (reason) => {
    console.warn("Socket desconectado:", reason);
});

socket.on("connect_error", (error) => {
    console.error("Error al conectar con Socket.IO:", error.message);
});

// Método para registrar un evento personalizado (como "message")
export const listenToMessage = (callback) => {
    socket.on("message", (data) => {
        console.log("Nuevo mensaje recibido:", data);
        callback(data); // Llama al callback proporcionado con los datos del mensaje
    });
};

// Método para emitir mensajes al servidor
export const sendMessage = (message) => {
    if (socket.connected) {
        socket.emit("message", message);
        console.log("Mensaje enviado:", message);
    } else {
        console.error("No se puede enviar el mensaje. Socket desconectado.");
    }
};

export default socket;
