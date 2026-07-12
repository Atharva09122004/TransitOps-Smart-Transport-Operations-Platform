const express = require("express");
const maintenanceController = require("../controllers/maintenance.controller");

const router = express.Router();

router.post("/", maintenanceController.create);
router.get("/", maintenanceController.getAll);
router.put("/:id", maintenanceController.update);
router.patch("/:id/complete", maintenanceController.complete);

module.exports = router;