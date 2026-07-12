const { createVehicleSchema, updateVehicleSchema, queryVehicleSchema } = require("../validators/vehicle.validator");
const vehicleService = require("../services/vehicle.service");

async function create(req, res) {
  const parsed = createVehicleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const vehicle = await vehicleService.createVehicle(parsed.data);
    return res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      vehicle,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}

async function getAll(req, res) {
  const parsed = queryVehicleSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid query parameters",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const vehicles = await vehicleService.getAllVehicles(parsed.data);
    return res.status(200).json({
      success: true,
      count: vehicles.length,
      vehicles,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}

async function getById(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid vehicle ID. ID must be an integer.",
    });
  }

  try {
    const vehicle = await vehicleService.getVehicleById(id);
    return res.status(200).json({
      success: true,
      vehicle,
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
      message: "Invalid vehicle ID. ID must be an integer.",
    });
  }

  const parsed = updateVehicleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const vehicle = await vehicleService.updateVehicle(id, parsed.data);
    return res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      vehicle,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}

async function deleteVehicle(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid vehicle ID. ID must be an integer.",
    });
  }

  try {
    const result = await vehicleService.deleteVehicle(id);
    return res.status(200).json(result);
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
  getById,
  update,
  delete: deleteVehicle,
};
