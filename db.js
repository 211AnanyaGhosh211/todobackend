const mongoose = require("mongoose");

const uri = "mongodb+srv://ananya:Ananya%402002@cluster0.hrk8yr9.mongodb.net/todo_db?retryWrites=true&w=majority&appName=Cluster0";

async function connectDB() {
  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB Connected via Mongoose...");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    throw err;
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Closing MongoDB connection...');
  await mongoose.connection.close();
  process.exit(0);
});

module.exports = { connectDB };
