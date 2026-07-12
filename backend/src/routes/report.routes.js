const express = require("express");
const reportController = require("../controllers/report.controller");

const router = express.Router();

router.get("/", reportController.getReport);

module.exports = router;
