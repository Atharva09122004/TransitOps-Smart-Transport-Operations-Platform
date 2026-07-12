const { createFuelSchema } = require("../validators/fuel.validator");
const fuelService = require("../services/fuel.service");

async function create(req, res) {
  const parsed = createFuelSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const log = await fuelService.createFuelLog(parsed.data);
    return res.status(201).json({
      success: true,
      message: "Fuel log created successfully",
      log,
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
    const logs = await fuelService.getAllFuelLogs();
    return res.status(200).json({
      success: true,
      count: logs.length,
      logs,
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
