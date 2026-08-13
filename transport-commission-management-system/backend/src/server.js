import app from "./app.js";
import { connectDB } from "./config/database.js";
import { config } from "./config/environment.js";

async function startServer() {
  await connectDB();
  
  app.listen(config.port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${config.port}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
