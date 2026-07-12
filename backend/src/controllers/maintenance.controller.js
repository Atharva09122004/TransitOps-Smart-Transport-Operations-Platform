const { createMaintenanceSchema, updateMaintenanceSchema } = require("../validators/maintenance.validator");
const maintenanceService = require("../services/maintenance.service");

async function create(req, res) {
  const parsed = createMaintenanceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const record = await maintenanceService.createMaintenance(parsed.data);
    return res.status(201).json({
      success: true,
      message: "Maintenance record created successfully",
      record,
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
    const records = await maintenanceService.getAllMaintenance();
    return res.status(200).json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}

async function update(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid maintenance ID. ID must be an integer.",
    });
  }

  const parsed = updateMaintenanceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const record = await maintenanceService.updateMaintenance(id, parsed.data);
    return res.status(200).json({
      success: true,
      message: "Maintenance record updated successfully",
      record,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}

async function complete(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid maintenance ID. ID must be an integer.",
    });
  }

  try {
    const record = await maintenanceService.completeMaintenance(id);
    return res.status(200).json({
      success: true,
      message: "Maintenance completed successfully",
      record,
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
  update,
  complete,
};
