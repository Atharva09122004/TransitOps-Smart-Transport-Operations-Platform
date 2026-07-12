const express = require("express");
const dashboardController = require("../controllers/dashboard.controller");
const authenticate = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");

const router = express.Router();

router.get("/", authenticate, requireRole("FLEET_MANAGER", "SAFETY_OFFICER", "FINANCIAL_ANALYST", "DRIVER"), dashboardController.getStats);

module.exports = router;