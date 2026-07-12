const express = require("express");
const settingsController = require("../controllers/settings.controller");

const router = express.Router();

router.get("/", settingsController.getSettings);
router.put("/", settingsController.updateSettings);

module.exports = router;
