import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/login", authController.login);
router.get("/me", authenticateToken, authController.getMe);

export default router;
