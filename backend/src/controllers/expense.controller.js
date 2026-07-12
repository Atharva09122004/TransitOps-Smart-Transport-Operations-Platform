const { createExpenseSchema } = require("../validators/expense.validator");
const expenseService = require("../services/expense.service");

async function create(req, res) {
  const parsed = createExpenseSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const expense = await expenseService.createExpense(parsed.data);
    return res.status(201).json({
      success: true,
      message: "Expense created successfully",
      expense,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}

async function getAll(req, res) {
  try {
    const expenses = await expenseService.getAllExpenses();
    return res.status(200).json({
      success: true,
      count: expenses.length,
      expenses,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}

module.exports = {
  create,
  getAll,
};
