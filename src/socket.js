import { io } from "socket.io-client";

// Cambia esta URL por la de tu servidor
const socket = io("http://localhost:5030", {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
});

export default socket;
