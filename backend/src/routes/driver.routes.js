const express = require("express");
const authenticate = require("../middleware/auth.middleware");
const { createDriver } = require("../controllers/driver.controller");

const router = express.Router();

router.post("/", authenticate, createDriver);

module.exports = router;