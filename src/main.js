import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

// Importa Bootstrap y Bootstrap CSS
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

// Importa tus estilos personalizados
import "@/assets/styles/main.scss";

const app = createApp(App);
app.use(router);
app.use(store); // Usa el store aquí
app.mount("#app");
