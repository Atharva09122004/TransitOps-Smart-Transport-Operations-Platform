const express = require("express");
const authenticate = require("../middleware/auth.middleware");
const {
  createDriver,
  getDrivers,
  updateDriver,
  deleteDriver,
} = require("../controllers/driver.controller");

const router = express.Router();

router.post("/", authenticate, createDriver);
router.get("/", authenticate, getDrivers);
router.put("/:id", authenticate, updateDriver);
router.delete("/:id", authenticate, deleteDriver);

module.exports = router;