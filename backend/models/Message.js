const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    author: { type: String, required: true },
    content: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now },
    media: { type: String, default: null }, // URL del archivo adjunto (puede ser null)
    mediaType: {
        type: String,
        enum: ["image", "video", "pdf", "file", null], // Agregamos "video" y "pdf"
        default: null
    }, // Tipo de archivo adjunto
});

module.exports = mongoose.model("Message", MessageSchema);