const mongoose = require("mongoose");

const connect = async () => {
    try {
        const response = await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully");
        return response;
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        throw new Error("Failed to connect to MongoDB");
    }
}

module.exports = connect;