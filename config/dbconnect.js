const mongoose = require("mongoose");
// require("dotenv").config(); // Add this to load the .env file

const connect = async () => {
  try {
    const response = await mongoose.connect(process.env.MONGO_URI);
    return response;
  } catch (error) {
    throw new Error("Failed to connect to MongoDB");
  }
};

module.exports = connect;
