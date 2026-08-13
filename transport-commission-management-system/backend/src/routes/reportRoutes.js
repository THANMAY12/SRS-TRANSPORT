import { Router } from "express";
import * as reportController from "../controllers/reportController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticateToken);

router.get("/", reportController.getReports);

export default router;
