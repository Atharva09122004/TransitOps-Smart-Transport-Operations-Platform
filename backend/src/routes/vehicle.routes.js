const express = require("express");
const vehicleController = require("../controllers/vehicle.controller");

const router = express.Router();

router.post("/", vehicleController.create);
router.get("/", vehicleController.getAll);
router.get("/:id", vehicleController.getById);
router.put("/:id", vehicleController.update);
router.delete("/:id", vehicleController.delete);

module.exports = router;