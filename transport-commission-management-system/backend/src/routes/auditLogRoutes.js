import { Router } from "express";
import * as auditLogController from "../controllers/auditLogController.js";
import { authenticateToken, requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticateToken, requireAdmin);

router.get("/", auditLogController.getAuditLogs);

export default router;
