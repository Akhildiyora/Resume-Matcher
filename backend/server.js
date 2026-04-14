require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./src/app");
const realtimeService = require("./src/services/realtimeService");
const pool = require("./src/config/db");

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

realtimeService.setIo(io);

// Test database connection
(async () => {
  try {
    const client = await pool.connect();
    console.log("Database connected successfully");
    client.release();
  } catch (err) {
    console.error("Database connection failed:", err.message);
  }
})();

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment PORT: ${process.env.PORT}`);
});
