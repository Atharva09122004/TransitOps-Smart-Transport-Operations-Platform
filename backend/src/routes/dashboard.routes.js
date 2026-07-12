const express = require("express");
const dashboardController = require("../controllers/dashboard.controller");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ message: "Dashboard routes ready." });
});

router.get("/", dashboardController.getStats);

module.exports = router;