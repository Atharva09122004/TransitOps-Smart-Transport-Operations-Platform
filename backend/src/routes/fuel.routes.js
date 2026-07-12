const express = require("express");
const fuelController = require("../controllers/fuel.controller");
const authenticate = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");

const router = express.Router();

router.get("/", authenticate, requireRole("FLEET_MANAGER", "FINANCIAL_ANALYST", "SAFETY_OFFICER"), fuelController.getAll);
router.post("/", authenticate, requireRole("FLEET_MANAGER", "DISPATCHER"), fuelController.create);

module.exports = router;