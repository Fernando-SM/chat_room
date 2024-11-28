const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Registro de usuario
exports.registerUser = async (req, res) => {
    const { username, password } = req.body;

    // Validar datos de entrada
    if (!username || !password) {
        return res.status(400).json({ message: "El nombre de usuario y la contraseña son obligatorios." });
    }

    try {
        // Verificar si el usuario ya existe
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: "El usuario ya existe." });
        }

        // Crear un nuevo usuario
        const user = new User({ username, password });
        await user.save();

        // Verificar el secreto JWT
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error("Falta la clave JWT_SECRET en las variables de entorno");
            return res.status(500).json({ message: "Configuración del servidor incompleta." });
        }

        // Generar un token JWT
        const token = jwt.sign(
            { id: user._id, username: user.username },
            secret,
            { expiresIn: process.env.JWT_EXPIRATION || "1d" }
        );
        console.log("JWT_SECRET:", process.env.JWT_SECRET);

        // Responder con éxito
        res.status(201).json({
            message: "Usuario registrado con éxito",
            user: { id: user._id, username: user.username },
            token,
        });
    } catch (error) {
        console.log("JWT_SECRET:", process.env.JWT_SECRET);

        console.error("Error en el registro:", error.message);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};


// Inicio de sesión
exports.loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Buscar el usuario en la base de datos
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }

        // Verificar si las contraseñas coinciden
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Contraseña incorrecta." });
        }

        // Generar un token JWT
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET, // Clave secreta para el token
            { expiresIn: "1d" } // Expiración de 1 día
        );

        // Enviar el token y los datos del usuario en la respuesta
        res.status(200).json({
            message: "Inicio de sesión exitoso",
            user: { id: user._id, username: user.username },
            token, // Este token debe enviarse al frontend
        });
    } catch (error) {
        console.error("Error al iniciar sesión:", error.message);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

