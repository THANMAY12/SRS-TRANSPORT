import { Router } from "express";
import * as tripController from "../controllers/tripController.js";
import { authenticateToken, requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticateToken);

router.get("/", tripController.getTrips);
router.post("/", tripController.createTrip);
router.get("/pending-commission", tripController.getPendingCommissionTrips);
router.get("/pending-advance-vehicle", tripController.getPendingAdvanceVehicleTrips);
router.get("/pending-advance-company", tripController.getPendingAdvanceCompanyTrips);
router.get("/balance-vehicle", tripController.getBalanceVehicleTrips);
router.get("/balance-company", tripController.getBalanceCompanyTrips);
router.get("/pending-approvals", requireAdmin, tripController.getPendingApprovalTrips);
router.get("/pending-refunds", tripController.getPendingRefundTrips);
router.put("/:id", tripController.updateTrip);
router.delete("/:id", requireAdmin, tripController.deleteTrip);
router.patch("/:id/approve", requireAdmin, tripController.approveTrip);
router.patch("/:id/reject", requireAdmin, tripController.rejectTrip);
router.patch("/:id/refund", tripController.setTripRefund);
router.post("/:id/clear-vehicle-balance", tripController.clearVehicleBalance);
router.post("/:id/clear-company-balance", tripController.clearCompanyBalance);

export default router;
