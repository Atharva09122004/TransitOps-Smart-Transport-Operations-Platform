const express = require("express");
const reportController = require("../controllers/report.controller");
const authenticate = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");

const router = express.Router();

router.get("/", authenticate, requireRole("FLEET_MANAGER", "FINANCIAL_ANALYST", "SAFETY_OFFICER"), reportController.getReport);

module.exports = router;
