require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const { PORT } = require("./config/env");

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`KrishiDhara server running on port ${PORT}`);
  });
};

start();
