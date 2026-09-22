const mongoose = require("mongoose");
const { MONGO_URI } = require("./env");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      // Modern Mongoose (>=6) doesn't need these options, but keeping explicit
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1); // Exit immediately — app cannot run without DB
  }
}; 

module.exports = connectDB;
