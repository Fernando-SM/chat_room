<template>
  <div class="chat-container">
    <header class="chat-header">
      <div class="header-content">
        <div class="user-info">
          <h2>Chat Room</h2>
          <p>Conectado como: <strong>{{ username }}</strong></p>
        </div>
        <div class="search-container">
          <input
              v-model="searchTerm"
              type="text"
              placeholder="🔍 Buscar mensajes..."
              @input="searchMessages"
          />
        </div>
      </div>
    </header>


    <div ref="chatBox" class="chat-box">
      <div
          v-for="(msg, index) in filteredMessages"
          :key="index"
          :class="['message', msg.author === username ? 'outgoing' : 'incoming']"
      >
        <div class="message-content">
          <!-- Contenido del mensaje -->
          <p v-if="msg.content" class="content">{{ msg.content }}</p>

          <!-- Medios (imagen, video, PDF, otros archivos) -->
          <template v-if="msg.media">
            <!-- Mostrar imágenes -->
            <img
                v-if="msg.mediaType === 'image'"
                :src="resolveMediaUrl(msg.media)"
                alt="Imagen enviada"
                class="media"
            />

            <!-- Mostrar PDFs con botón de descarga -->
            <div v-else-if="msg.mediaType === 'pdf'" class="pdf-container">
              <iframe
                  :src="resolveMediaUrl(msg.media)"
                  class="pdf-viewer"
              ></iframe>
              <a
                  :href="resolveMediaUrl(msg.media)"
                  download
                  class="download-link"
              >
                Descargar archivo
              </a>
            </div>

            <!-- Mostrar videos -->
            <video
                v-else-if="msg.mediaType === 'video'"
                controls
                class="video-player"
            >
              <source :src="resolveMediaUrl(msg.media)"/>
            </video>

            <!-- Archivos sin vista previa (botón de descarga directa) -->
            <div v-else class="file-container">
              <i class="file-icon">📎</i>
              <a
                  :href="resolveMediaUrl(msg.media)"
                  download
                  class="file-link"
              >
                Descargar archivo
              </a>
            </div>
          </template>

          <!-- Metadatos -->
          <div class="metadata">

            <span class="timestamp"><span class="author">{{
                msg.author
              }} </span> {{ new Date(msg.timestamp).toLocaleString() }}</span>
          </div>


        </div>
      </div>
    </div>


    <div v-if="typingUser" class="typing-indicator">
      {{ typingUser }} está escribiendo...
    </div>

    <footer class="chat-footer">
      <div class="input-container">
        <button @click="toggleEmojiPicker" class="emoji-button" aria-label="Seleccionar emoji">
          😀
        </button>
        <input
            v-model="newMessage"
            type="text"
            placeholder="Escribe un mensaje..."
            @keydown.enter="sendMessage"
            @input="onTyping"
            @focus="onTyping"
            @blur="stopTyping"
            :disabled="isSending"
            class="message-input"
        />
        <label for="fileInput" class="file-upload-button" aria-label="Adjuntar archivo">
          📎
        </label>
        <input
            type="file"
            id="fileInput"
            ref="fileInput"
            @change="handleFileUpload"
            class="file-input"
        />
        <button @click="sendMessage" class="send-button" :disabled="isSending" aria-label="Enviar mensaje">
          Enviar
        </button>
      </div>
      <emoji-picker v-if="showEmojiPicker" @emoji-click="addEmoji"></emoji-picker>
    </footer>


  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import socket from "@/socket";
import axios from "axios";

// Importar el emoji-picker
import "emoji-picker-element";

export default {
  data() {
    return {
      newMessage: "",
      isSending: false,
      typingUser: null,
      typingTimeout: null,
      showEmojiPicker: false,
      searchTerm: "", // Término de búsqueda ingresado por el usuario
      filteredMessages: [], // Mensajes filtrados basados en la búsqueda
    };
  },
  computed: {
    ...mapState(["username", "messages"]),
  },
  watch: {
    messages: {
      handler() {
        this.filteredMessages = this.messages;
      },
      immediate: true,
    },
  },
  methods: {
    ...mapActions([
      "fetchMessages",
      "sendMessage",
      "listenForMessages",
      "connectSocket",
      "disconnectSocket",
    ]),

    // Convierte una URL relativa a absoluta si es necesario
    resolveMediaUrl(mediaPath) {
      const baseUrl = process.env.VUE_APP_API_BASE_URL; // Base URL desde el .env
      return mediaPath.startsWith("/")
          ? `${baseUrl}${mediaPath}`
          : mediaPath; // Si ya es absoluta, la deja igual
    },

    getFileName(url) {
      return url.split("/").pop();
    },

    async handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      try {
        this.isSending = true;
        const formData = new FormData();
        formData.append("file", file);

        const apiBaseUrl = process.env.VUE_APP_API_BASE_URL; // Desde el .env
        const response = await axios.post(`${apiBaseUrl}/api/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const fileExt = file.name.split(".").pop().toLowerCase();
        const mediaType = ["jpg", "jpeg", "png", "gif"].includes(fileExt)
            ? "image"
            : fileExt === "pdf"
                ? "pdf"
                : ["mp4", "webm"].includes(fileExt)
                    ? "video"
                    : "file";

        const message = {
          author: this.username,
          content: "",
          timestamp: new Date(),
          media: response.data.url,
          mediaType,
        };

        // Solo emite el mensaje
        socket.emit("message", message);

        this.$refs.fileInput.value = null;
        this.scrollToBottom();
      } catch (error) {
        console.error("Error al subir archivo:", error);
      } finally {
        this.isSending = false;
      }
    },

    async sendMessage() {
      if (!this.newMessage.trim()) return;

      this.isSending = true;
      const messageContent = this.newMessage.trim();

      try {
        const message = {
          author: this.username,
          content: messageContent,
          timestamp: new Date(),
        };

        socket.emit("message", message);

        this.newMessage = "";
        this.stopTyping();
        this.scrollToBottom();
      } catch (error) {
        console.error("Error al enviar mensaje:", error.response?.data || error.message);
      } finally {
        this.isSending = false;
      }
    },

    onTyping() {
      socket.emit("typing", this.username);

      if (this.typingTimeout) clearTimeout(this.typingTimeout);

      this.typingTimeout = setTimeout(() => {
        this.stopTyping();
      }, 2000);
    },

    stopTyping() {
      socket.emit("stopTyping", this.username);
      this.typingTimeout = null;
    },

    scrollToBottom() {
      const chatBox = this.$refs.chatBox;
      if (chatBox) {
        chatBox.scrollTop = chatBox.scrollHeight;
      }
    },

    toggleEmojiPicker() {
      this.showEmojiPicker = !this.showEmojiPicker;
    },

    addEmoji(event) {
      const emoji = event.detail.unicode;
      this.newMessage += emoji;
      this.showEmojiPicker = false;
    },

    searchMessages() {
      if (this.searchTerm.trim() === "") {
        this.filteredMessages = this.messages;
      } else {
        const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
        this.filteredMessages = this.messages.filter((message) =>
            message.content?.toLowerCase().includes(lowerCaseSearchTerm)
        );
      }
    },
  },
  async mounted() {
    socket.on("message", (message) => {
      this.messages.push(message);
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    });

    socket.on("typing", (username) => {
      if (username !== this.username) {
        this.typingUser = username;
      }
    });

    socket.on("stopTyping", (username) => {
      if (username === this.typingUser) {
        this.typingUser = null;
      }
    });

    this.connectSocket();
    await this.fetchMessages();
    this.$nextTick(() => {
      this.scrollToBottom();
    });
  },
  beforeUnmount() {
    socket.off("message");
    socket.off("typing");
    socket.off("stopTyping");
    this.disconnectSocket();
  },
};
</script>


<style lang="scss" scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: "Arial", sans-serif;
  background: #e5ddd5; /* Fondo como WhatsApp */
}

header {
  background: #075e54; /* Color verde oscuro */
  color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.header-content h2 {
  font-size: 1.5rem;
}

.search-container {
  margin-top: 10px;
  padding: 0 20px;
}

.search-container input {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 20px;
  font-size: 1rem;
  background: #f0f0f0;
}

.chat-box {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #dcf8c6; /* Fondo verde claro */
}

.message {
  display: flex;
  flex-direction: column;
  max-width: 70%;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 5px;
}

.incoming {
  align-self: flex-start;
  background: #fff; /* Fondo para mensajes entrantes */
  color: #000;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}

.outgoing {
  align-self: flex-end;
  background: #dcf8c6; /* Fondo para mensajes salientes */
  color: #000;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}

.message-content {
  display: flex;
  flex-direction: column;
}

.content {
  margin: 0;
}

.media {
  max-width: 100%;
  border-radius: 8px;
  margin-top: 8px;
}

.pdf-container,
.file-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  margin-top: 8px;
}

.file-link,
.download-link {
  color: #075e54;
  font-weight: bold;
  text-decoration: none;
  padding: 5px 10px;
  border-radius: 5px;
  background: #f0f0f0;
  cursor: pointer;
  transition: background 0.3s ease;
}

.file-link:hover,
.download-link:hover {
  background: #d1d1d1;
}

.video-player {
  max-width: 100%;
  border-radius: 8px;
  margin-top: 8px;
}

.pdf-viewer {
  width: 100%;
  height: 400px;
  border: none;
  border-radius: 8px;
}

.metadata {
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Alinear al inicio */
  gap: 2px; /* Espaciado entre fecha y nombre */

  .timestamp {
    font-size: 0.75rem;
    color: #666;
  }

  .author {
    font-weight: bold;
    color: #333;
    font-size: 0.9rem;
  }
}

footer {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  background: #075e54;
}

.input-container {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

input[type="text"] {
  flex: 1;
  padding: 10px 15px;
  border: none;
  border-radius: 20px;
  background: #f0f0f0;
  outline: none;
  font-size: 1rem;
}

.file-upload-button {
  font-size: 1.5rem;
  color: #fff;
  cursor: pointer;
}

.file-input {
  display: none;
}

.send-button {
  background: #25d366;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 1rem;
}

.send-button:hover {
  background: #1b9c51;
}

.emoji-button {
  font-size: 1.5rem;
  color: #fff;
  cursor: pointer;
}

.typing-indicator {
  padding: 10px;
  font-size: 0.9rem;
  color: #666;
}

@media (max-width: 768px) {
  .input-container {
    flex-direction: column;
    gap: 10px;
  }

  input[type="text"] {
    font-size: 0.9rem;
    padding: 8px 10px;
  }

  .send-button {
    padding: 10px;
    font-size: 0.9rem;
  }
}

.chat-header {
  background: #075e54; /* Color verde oscuro */
  color: white;
  padding: 10px 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
  }

  .user-info h2 {
    margin: 0;
    font-size: 1.5rem;
  }

  .user-info p {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 400;
    opacity: 0.8;
  }

  .search-container {
    position: relative;
    flex: 1;
    max-width: 300px;
  }

  .search-container input {
    width: 100%;
    padding: 8px 12px;
    border: none;
    border-radius: 20px;
    font-size: 0.9rem;
    background: #fff;
    color: #333;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    outline: none;
    transition: all 0.3s ease;

    &::placeholder {
      color: #aaa;
    }

    &:focus {
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    }
  }
}

.chat-footer {
  background: #ffffff;
  border-top: 1px solid #e0e0e0;
  padding: 10px 20px;
  display: flex;
  justify-content: center;

  .input-container {
    display: flex;
    align-items: center;
    width: 100%;
    max-width: 600px;
    gap: 10px;

    // Botón de emoji
    .emoji-button {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      transition: transform 0.2s ease;

      &:hover {
        transform: scale(1.2);
      }
    }

    // Campo de entrada de texto
    .message-input {
      flex: 1;
      padding: 10px 15px;
      border: 1px solid #ddd;
      border-radius: 20px;
      font-size: 1rem;
      outline: none;
      transition: border-color 0.2s ease;

      &::placeholder {
        color: #aaa;
      }

      &:focus {
        border-color: #0078ff;
      }
    }

    // Botón para subir archivos
    .file-upload-button {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #0078ff;
      transition: transform 0.2s ease;

      &:hover {
        transform: scale(1.2);
      }
    }

    .file-input {
      display: none;
    }

    // Botón de enviar
    .send-button {
      background: #0078ff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 20px;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.3s ease, transform 0.2s ease;

      &:hover {
        background: #005bb5;
        transform: scale(1.05);
      }

      &:disabled {
        background: #ccc;
        cursor: not-allowed;
      }
    }
  }

  // Responsividad para pantallas pequeñas
  @media (max-width: 768px) {
    .input-container {
      flex-direction: column;
      align-items: stretch;
      gap: 8px;

      .emoji-button,
      .file-upload-button,
      .send-button {
        font-size: 1.2rem;
        padding: 10px;
      }

      .message-input {
        width: 100%;
        padding: 12px;
        font-size: 1rem;
      }
    }
  }
}

</style>
