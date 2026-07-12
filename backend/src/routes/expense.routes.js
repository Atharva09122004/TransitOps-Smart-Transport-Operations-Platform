const express = require("express");
const expenseController = require("../controllers/expense.controller");
const authenticate = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");

const router = express.Router();

router.get("/", authenticate, requireRole("FLEET_MANAGER", "FINANCIAL_ANALYST"), expenseController.getAll);
router.post("/", authenticate, requireRole("FLEET_MANAGER", "DISPATCHER"), expenseController.create);

module.exports = router;
