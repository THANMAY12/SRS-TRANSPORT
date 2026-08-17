import app from "./app.js";
import { connectDB } from "./config/database.js";
import { config } from "./config/environment.js";

async function startServer() {
  await connectDB();
  const PORT = config.port || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/api/health`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
