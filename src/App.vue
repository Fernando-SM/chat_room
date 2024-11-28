<template>
  <div id="app">
<!--    <header v-if="isAuthenticated">
      <nav class="navbar">
        <span>Bienvenido, {{ username }}</span>
        <button @click="logout" class="logout-button">Cerrar sesión</button>
      </nav>
    </header>-->
    <router-view /> <!-- Renderiza las rutas configuradas -->
    <footer>
      <p>© 2024 ChatApp. Todos los derechos reservados.</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: "App",
  computed: {
    // Verifica si el usuario está autenticado (token en localStorage)
    isAuthenticated() {
      return !!localStorage.getItem("token");
    },
    // Recupera el nombre de usuario desde localStorage
    username() {
      return localStorage.getItem("username") || "Invitado";
    },
  },
  methods: {
    logout() {
      // Eliminar datos de autenticación
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      this.$router.push("/"); // Redirigir al login
    },
  },
};
</script>

<style>
/* Estilos generales */
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background-color: #f5f5f5;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

header {
  background-color: #0078ff;
  color: white;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.logout-button {
  background-color: #dc2430;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.logout-button:hover {
  background-color: #a31d24;
}

footer {
  background-color: #f1f1f1;
  color: #666;
  text-align: center;
  padding: 10px 0;
  font-size: 0.9rem;
  margin-top: auto;
  border-top: 1px solid #ddd;
}
</style>
