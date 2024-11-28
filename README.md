# Chat Room

Este es un proyecto de una aplicación de chat en tiempo real construida con **Vue.js**, **Vuex** en el front-end y **Node.js** en el back-end. La aplicación permite a los usuarios unirse a una sala de chat utilizando un nombre de usuario, enviar y recibir mensajes de texto, así como archivos e imágenes. Se utiliza **Socket.IO** para la comunicación en tiempo real y **MongoDB** para almacenar el historial de mensajes.

## Características del Proyecto
- **Chat en Tiempo Real**: Uso de Socket.IO para enviar y recibir mensajes en tiempo real entre usuarios conectados.
- **Chat Room Multiusuario**: Cada usuario debe proporcionar un nombre de usuario para unirse y participar en la sala de chat.
- **Historial de Mensajes**: Almacenamiento de mensajes en MongoDB, permitiendo a los usuarios ver los mensajes anteriores al ingresar.
- **Búsqueda de Mensajes**: Los usuarios pueden buscar en el historial de mensajes.
- **Envío de Archivos e Imágenes**: Los usuarios pueden enviar archivos e imágenes en el chat.
- **Vuex Store**: Para el manejo del estado global de la aplicación.
- **SCSS**: Uso de SCSS para los estilos del proyecto.
- **Bootstrap**: Utilizado para el diseño responsivo y componentes visuales mejorados.

## Requisitos Previos
- **Node.js v18**: Asegúrate de usar Node.js v18. Puedes manejar versiones de Node.js usando **nvm** (Node Version Manager).
- **MongoDB**: El proyecto usa MongoDB para el almacenamiento de datos. Puedes utilizar MongoDB Atlas (en la nube) o una instalación local de MongoDB.

## Configuración del Proyecto

### 1. Clonar el Repositorio
Clona este repositorio en tu máquina local:
```sh
https://github.com/tu-usuario/chat-room.git
cd chat-room
```

### 2. Configuración del Backend
- Dirígete a la carpeta del servidor (`/server`) y asegúrate de tener instaladas las dependencias necesarias:
```sh
cd server
npm install
```
- Asegúrate de tener MongoDB en funcionamiento (puedes usar el puerto predeterminado).
- Crea un archivo `.env` en la carpeta del servidor con las siguientes configuraciones:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chat-room
```

- Inicia el servidor:
```sh
npm run start
```

### 3. Configuración del Frontend
- Dirígete a la carpeta del frontend (`/client` o la carpeta principal del proyecto) e instala las dependencias necesarias:
```sh
cd ../client
npm install
```
- Inicia el servidor de desarrollo:
```sh
npm run serve
```

### 4. Instrucciones para Ejecutar el Proyecto Completo
Para correr el proyecto completo en modo de desarrollo:
1. Asegúrate de que MongoDB está funcionando.
2. Corre el servidor backend (desde la carpeta `server`):
   ```sh
   npm run start
   ```
3. Corre el servidor de frontend (desde la carpeta `client`):
   ```sh
   npm run serve
   ```

## Comandos Disponibles

### Compilación y Recarga Automática para Desarrollo
```sh
npm run serve
```
Esto iniciará el servidor en modo desarrollo con hot-reload.

### Compilación y Minificación para Producción
```sh
npm run build
```
Esto generará una versión optimizada para producción.

### Lint y Arreglo de Errores
```sh
npm run lint
```
Este comando ejecuta el linter sobre los archivos para mantener el código limpio.

## Tecnologías Usadas
- **Vue.js** para el front-end.
- **Vuex** para el manejo del estado global.
- **Node.js y Express** para el back-end.
- **Socket.IO** para la comunicación en tiempo real.
- **MongoDB** como base de datos.
- **Bootstrap** para el diseño responsivo.
- **SCSS** para los estilos del proyecto.
- **Font Awesome** para los íconos del UI.

## Archivos Importantes
- `server/app.js`: Archivo principal del servidor backend.
- `client/src/views/ChatRoom.vue`: Componente Vue principal del chat.
- `client/src/assets/styles/main.scss`: Archivo de estilos SCSS del proyecto.

## Uso de `nvm` para Node.js v18
Si tienes diferentes versiones de Node.js instaladas, puedes usar `nvm` para cambiar a la versión 18:
```sh
nvm install 18
nvm use 18
```
Esto asegurará que estés usando la versión correcta para el proyecto.

## Notas
- Asegúrate de que la conexión con MongoDB sea exitosa para evitar errores relacionados con la base de datos.
- En caso de usar **MongoDB Atlas**, reemplaza `MONGODB_URI` con la URL de conexión correspondiente.

Para más información, consulta la documentación de [Vue CLI](https://cli.vuejs.org/config/) y [Express](https://expressjs.com/).