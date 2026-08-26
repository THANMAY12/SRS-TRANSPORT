import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { config } from "../config/environment.js";

export const applySecurityMiddleware = (app) => {
  app.use(helmet());

  const allowedOrigins = [
  ...config.frontendUrl.split(",").map((url) => url.trim()),
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
].filter(Boolean);

  const corsOptions = {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || config.nodeEnv === "development") {
        callback(null, true);
      } else {
        callback(new Error("CORS Policy: Origin not allowed"));
      }
    },
    credentials: true,
  };

  app.use(cors(corsOptions));

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: "Too many requests from this IP, please try again after 15 minutes",
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use("/api", limiter);
};
