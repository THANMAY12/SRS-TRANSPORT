import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

export const applySecurityMiddleware = (app) => {
  app.use(helmet());
  app.use(cors());

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: "Too many requests from this IP, please try again after 15 minutes",
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use("/api", limiter);
};
