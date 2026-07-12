const express = require("express");
const fuelController = require("../controllers/fuel.controller");

const router = express.Router();

router.post("/", fuelController.create);
router.get("/", fuelController.getAll);

module.exports = router;