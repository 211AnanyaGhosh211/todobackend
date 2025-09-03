const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { connectDB } = require("./db");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Import routes
const uploadRoutes = require("./routes/upload");

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Backend server is running!" });
});

// Use upload routes
app.use("/api/upload", uploadRoutes);

// Initialize MySQL connection
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
