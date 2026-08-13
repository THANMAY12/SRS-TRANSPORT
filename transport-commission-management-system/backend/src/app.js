import express from "express";
import path from "path";
import apiRoutes from "./routes/index.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import { applySecurityMiddleware } from "./middleware/securityMiddleware.js";
import { config } from "./config/environment.js";

const app = express();

app.use(express.json());
applySecurityMiddleware(app);

app.use("/api", apiRoutes);

if (config.nodeEnv === "production") {
  const distPath = path.join(process.cwd(), "../frontend/dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.use(errorHandler);

export default app;
