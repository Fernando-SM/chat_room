import { createRouter, createWebHistory } from "vue-router";
import LoginPage from "../views/Login.vue";
import RegisterPage from "../views/Register.vue";
import ChatRoom from "../views/ChatRoom.vue";

const routes = [
    {
        path: "/",
        name: "LoginPage",
        component: LoginPage,
        meta: { guest: true }, // Solo usuarios no autenticados
    },
    {
        path: "/register",
        name: "RegisterPage",
        component: RegisterPage,
        meta: { guest: true }, // Solo usuarios no autenticados
    },
    {
        path: "/chat",
        name: "ChatRoom",
        component: ChatRoom,
        meta: { requiresAuth: true }, // Solo usuarios autenticados
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// Middleware global para proteger rutas
router.beforeEach((to, from, next) => {
    const isAuthenticated = !!localStorage.getItem("token"); // Verifica si hay un token en localStorage

    // Redirigir a la página de inicio de sesión si la ruta requiere autenticación
    if (to.meta.requiresAuth && !isAuthenticated) {
        return next({ name: "LoginPage" });
    }

    // Evitar que usuarios autenticados accedan a páginas de invitado
    if (to.meta.guest && isAuthenticated) {
        return next({ name: "ChatRoom" });
    }

    next(); // Permitir el acceso
});

export default router;
