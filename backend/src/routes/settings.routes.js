const express = require("express");
const settingsController = require("../controllers/settings.controller");
const authenticate = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");

const router = express.Router();

router.get("/", authenticate, settingsController.getSettings);
router.put("/", authenticate, requireRole("FLEET_MANAGER"), settingsController.updateSettings);

module.exports = router;
