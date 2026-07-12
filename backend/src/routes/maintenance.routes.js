const express = require("express");
const maintenanceController = require("../controllers/maintenance.controller");
const authenticate = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");

const router = express.Router();

router.get("/", authenticate, requireRole("FLEET_MANAGER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"), maintenanceController.getAll);
router.post("/", authenticate, requireRole("FLEET_MANAGER", "SAFETY_OFFICER"), maintenanceController.create);
router.put("/:id", authenticate, requireRole("FLEET_MANAGER", "SAFETY_OFFICER"), maintenanceController.update);
router.patch("/:id/complete", authenticate, requireRole("FLEET_MANAGER", "SAFETY_OFFICER"), maintenanceController.complete);

module.exports = router;