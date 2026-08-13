import { Router } from "express";
import * as workerController from "../controllers/workerController.js";
import { authenticateToken, requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticateToken, requireAdmin);

router.get("/", workerController.getWorkers);
router.post("/", workerController.createWorker);
router.put("/:id", workerController.updateWorker);
router.delete("/:id", workerController.deleteWorker);

export default router;
