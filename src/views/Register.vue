<template>
  <div class="register-container">
    <div class="register-card">
      <h1>Crear una cuenta</h1>
      <form @submit.prevent="handleRegister">
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
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
        <button type="submit" class="btn-primary" :disabled="isLoading">
          <span v-if="!isLoading">Registrarse</span>
          <span v-else>
            <div id="spinner"></div>
          </span>
        </button>
      </form>
      <p>
        ¿Ya tienes cuenta?
        <router-link to="/">Inicia sesión</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import API from "../services/api"; // Archivo donde defines tu instancia Axios

export default {
  name: "RegisterPage",
  data() {
    return {
      username: "",
      password: "",
      errorMessage: null,
      successMessage: null,
      isLoading: false, // Indicador de carga
    };
  },
  methods: {
    async handleRegister() {
      try {
        const response = await API.post("/auth/register", {
          username: this.username,
          password: this.password,
        });

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("username", response.data.user.username); // Guarda el username

        // Guardar el username en Vuex
        this.$store.dispatch("setUsername", response.data.user.username);

        this.successMessage = response.data.message;

        setTimeout(() => {
          this.$router.push("/chat");
        }, 1000);
      } catch (error) {
        this.errorMessage = error.response?.data?.message || "Error al registrar usuario.";
      }
    }


  },
};
</script>

<style lang="scss" scoped>
/* Misma estructura CSS */
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(to bottom right, #7b4397, #dc2430);
  color: #fff;
  font-family: "Arial", sans-serif;
}

.register-card {
  background: #fff;
  border-radius: 8px;
  padding: 30px 40px;
  text-align: center;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  color: #333;
}

h1 {
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
  background: #dc2430;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.3s;
}

.btn-primary:disabled {
  background: #a31d24;
  cursor: not-allowed;
}

.error-message {
  color: red;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.success-message {
  color: green;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

a {
  color: #dc2430;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
