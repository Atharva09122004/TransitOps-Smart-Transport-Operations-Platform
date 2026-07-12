const express = require("express");
const authenticate = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");
const {
  createDriver,
  getDrivers,
  updateDriver,
  deleteDriver,
} = require("../controllers/driver.controller");

const router = express.Router();

router.get("/", authenticate, requireRole("FLEET_MANAGER", "SAFETY_OFFICER", "DISPATCHER"), getDrivers);
router.post("/", authenticate, requireRole("FLEET_MANAGER", "DISPATCHER"), createDriver);
router.put("/:id", authenticate, requireRole("FLEET_MANAGER"), updateDriver);
router.delete("/:id", authenticate, requireRole("FLEET_MANAGER"), deleteDriver);

module.exports = router;