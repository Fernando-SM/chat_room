import axios from "axios";

const API = axios.create({
    baseURL: process.env.VUE_APP_API_BASE_URL,
});

// Interceptores de solicitudes para agregar el token JWT
API.interceptors.request.use(
    (config) => {
        // Definir rutas públicas que no necesitan autenticación
        const publicRoutes = ["/auth/register", "/auth/login"];
        const isPublicRoute = publicRoutes.some((route) => config.url.includes(route));

        if (!isPublicRoute) {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No hay token, redirigiendo al login");
                // Redirigir al usuario si no hay token
                window.location.href = "/";
                return Promise.reject("No hay token disponible");
            }
            // Añadir el token en las cabeceras de autorización
            config.headers["Authorization"] = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptores de respuestas para manejar errores globales
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    console.error("No autorizado, redirigiendo al login...");
                    // Limpiar el token inválido y redirigir al login
                    localStorage.removeItem("token");
                    window.location.href = "/";
                    break;
                case 403:
                    console.error("Acceso denegado:", error.response.data.message);
                    break;
                case 404:
                    console.error("Ruta no encontrada:", error.response.data.message);
                    break;
                default:
                    console.error("Error en la API:", error.response.data.message || error.message);
                    break;
            }
        } else {
            console.error("Error en la conexión:", error.message);
        }
        return Promise.reject(error);
    }
);

export default API;
