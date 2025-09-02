const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { connectDB } = require("./db");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const todosRoutes = require("./routes/todos");
app.use("/api/todos", todosRoutes);

// Initialize MongoDB connection
async function startServer() {
  try {
    await connectDB();
    app.listen(5000, () => console.log("🚀 Server running on port 5000"));
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
