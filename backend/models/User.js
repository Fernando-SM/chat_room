const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
}, { timestamps: true });

// Middleware `pre("save")` para cifrar la contraseña
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Metodo para verificar contraseñas
UserSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Eliminar la contraseña del objeto retornado
UserSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

// Índice para consultas rápidas
UserSchema.index({ username: 1 });

module.exports = mongoose.model("User", UserSchema);
