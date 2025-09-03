const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '12345',
  database: 'media_test',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

async function connectDB() {
  try {
    // Test the connection
    const connection = await pool.getConnection();
    console.log("✅ MySQL Connected successfully...");
    connection.release();
    
    // Create videos table if it doesn't exist
    await createVideosTable();
  } catch (err) {
    console.error("❌ MySQL connection error:", err);
    throw err;
  }
}

async function createVideosTable() {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS videos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        video_data LONGBLOB NOT NULL
      )
    `;
    
    await pool.execute(createTableQuery);
    console.log("✅ Videos table created/verified successfully");
  } catch (err) {
    console.error("❌ Error creating videos table:", err);
    throw err;
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Closing MySQL connection pool...');
  await pool.end();
  process.exit(0);
});

module.exports = { connectDB, pool };
