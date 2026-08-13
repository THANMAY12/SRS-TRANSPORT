import { Router } from "express";
import authRoutes from "./authRoutes.js";
import tripRoutes from "./tripRoutes.js";
import workerRoutes from "./workerRoutes.js";
import reportRoutes from "./reportRoutes.js";
import auditLogRoutes from "./auditLogRoutes.js";
import * as reportController from "../controllers/reportController.js";
import * as tripService from "../services/tripService.js";
import * as auditLogService from "../services/auditLogService.js";
import { authenticateToken, requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

router.use("/auth", authRoutes);
router.use("/trips", tripRoutes);
router.use("/workers", workerRoutes);
router.use("/reports", reportRoutes);
router.use("/audit-logs", auditLogRoutes);

// Map the dashboard stats explicitly
router.get("/dashboard/stats", authenticateToken, reportController.getDashboardStats);

// Backup route
router.get("/backup", authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const trips = await tripService.getAllTrips();
    const logs = await auditLogService.getAuditLogs();
    const backupData = {
      backupDate: new Date().toISOString(),
      trips,
      auditLogs: logs,
    };

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=transport_system_backup_${Date.now()}.json`
    );
    res.send(JSON.stringify(backupData, null, 2));
  } catch (err) {
    next(err);
  }
});

export default router;
