import { createStore } from "vuex";
import API from "@/services/api"; // Servicio de API
import socket, { connectSocket, disconnectSocket } from "@/services/socket"; // Servicio Socket.IO

const store = createStore({
    state: {
        username: localStorage.getItem("username") || "", // Cargar username desde localStorage
        messages: [],
    },
    mutations: {
        setUsername(state, username) {
            state.username = username;
        },
        setMessages(state, messages) {
            state.messages = messages;
        },
        addMessage(state, message) {
            state.messages.push(message);
        },
    },
    actions: {
        // Establecer el username y guardarlo en localStorage
        setUsername({ commit }, username) {
            commit("setUsername", username);
            localStorage.setItem("username", username); // Guardar en localStorage
        },

        // Obtener mensajes del backend
        async fetchMessages({ commit }) {
            try {
                const response = await API.get("/messages");
                commit("setMessages", response.data); // Guardar mensajes en el estado
            } catch (error) {
                console.error("Error al obtener mensajes:", error.response?.data || error.message);
            }
        },

        // Enviar un mensaje al backend y transmitirlo a través de Socket.IO
        async sendMessage({ commit, state }, messageContent) {
            if (!state.username) {
                console.error("El usuario no está autenticado. No se puede enviar el mensaje.");
                return;
            }

            try {
                const message = {
                    author: state.username,
                    content: messageContent,
                    timestamp: new Date().toISOString(),
                };

                const response = await API.post("/messages", message);
                commit("addMessage", response.data.message);
            } catch (error) {
                console.error("Error al enviar mensaje:", error.response?.data || error.message);
            }
        },


        // Escuchar mensajes en tiempo real a través de Socket.IO
        listenForMessages({ commit }) {
            socket.off("message"); // Eliminar listeners duplicados
            socket.on("message", (message) => {
                console.log("Mensaje recibido:", message);
                commit("addMessage", message);
            });
        },

        // Conectar el socket
        connectSocket({ state }) {
            if (!state.username) {
                console.error("No se puede conectar el socket sin un usuario autenticado.");
                return;
            }
            connectSocket();
        },

        // Desconectar el socket
        disconnectSocket() {
            socket.off("message"); // Eliminar listeners
            disconnectSocket();
        },
    },
    getters: {
        getMessages: (state) => state.messages,
        getUsername: (state) => state.username,
    },
});

export default store;
