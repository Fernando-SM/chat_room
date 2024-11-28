<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Bienvenido</h1>
      <p>Por favor, inicia sesión para continuar</p>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">Nombre de usuario</label>
          <input
              id="username"
              v-model="username"
              type="text"
              placeholder="Escribe tu nombre"
              required
          />
        </div>
        <div class="form-group">
          <label for="password">Contraseña</label>
          <input
              id="password"
              v-model="password"
              type="password"
              placeholder="Escribe tu contraseña"
              required
          />
        </div>
        <button type="submit" class="btn-primary">Entrar</button>
      </form>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <p>
        ¿No tienes cuenta?
        <router-link to="/register">Regístrate aquí</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import API from "@/services/api"; // Servicio para interactuar con el backend
import { mapActions } from "vuex";

export default {
  name: "LoginPage",
  data() {
    return {
      username: "",
      password: "",
      errorMessage: "",
    };
  },
  methods: {
    ...mapActions(["setUsername"]), // Integración con Vuex
    async handleLogin() {
      try {
        const response = await API.post("/auth/login", {
          username: this.username,
          password: this.password,
        });

        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          this.setUsername(response.data.user.username); // Actualiza el estado global
          this.$router.push("/chat");
        } else {
          this.errorMessage = "Error inesperado: No se recibió el token de autenticación.";
        }
      } catch (error) {
        this.errorMessage =
            error.response?.data?.message || "Error al iniciar sesión.";
        console.error("Error en el login:", error);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(to bottom right, #4a90e2, #9013fe);
  color: #fff;
  font-family: "Arial", sans-serif;
}

.login-card {
  background: #fff;
  border-radius: 8px;
  padding: 30px 40px;
  text-align: center;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  color: #333;
}

.login-card h1 {
  font-size: 2em;
  margin-bottom: 10px;
}

.form-group {
  margin-bottom: 20px;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.btn-primary {
  background: #4a90e2;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.3s;
}

.btn-primary:hover {
  background: #357ab8;
}

a {
  color: #4a90e2;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.error-message {
  color: red;
  font-size: 0.9rem;
  margin-top: 10px;
}
</style>
