const express = require("express");
const expenseController = require("../controllers/expense.controller");

const router = express.Router();

router.post("/", expenseController.create);
router.get("/", expenseController.getAll);

module.exports = router;
