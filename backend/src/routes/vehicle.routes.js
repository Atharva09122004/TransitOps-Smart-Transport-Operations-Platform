const express = require("express");
const vehicleController = require("../controllers/vehicle.controller");
const authenticate = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");

const router = express.Router();

router.get("/", authenticate, requireRole("FLEET_MANAGER", "SAFETY_OFFICER", "DRIVER"), vehicleController.getAll);
router.get("/:id", authenticate, requireRole("FLEET_MANAGER", "SAFETY_OFFICER", "DRIVER"), vehicleController.getById);
router.post("/", authenticate, requireRole("FLEET_MANAGER"), vehicleController.create);
router.put("/:id", authenticate, requireRole("FLEET_MANAGER"), vehicleController.update);
router.delete("/:id", authenticate, requireRole("FLEET_MANAGER"), vehicleController.delete);

module.exports = router;