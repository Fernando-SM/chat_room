import { io } from "socket.io-client";

// Cambia esta URL por la de tu servidor
const socket = io(process.env.VUE_APP_SOCKET_URL , {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
});

export default socket;
