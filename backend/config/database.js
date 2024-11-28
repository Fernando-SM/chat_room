const mongoose = require("mongoose");

const connectDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully");

        process.on("SIGINT", async () => {
            await mongoose.connection.close();
            console.log("MongoDB connection closed");
            process.exit(0);
        });
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        process.exit(1);
    }
};

module.exports = connectDatabase;
