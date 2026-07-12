const { z } = require("zod");
const driverService = require("../services/driver.service");

const createDriverSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  userId: z.union([z.number().int().positive(), z.null()]).optional(),
  licenseNo: z.string().trim().min(1, "License number is required"),
  category: z.string().trim().min(1, "Category is required"),
  licenseExpiry: z.string().trim().min(1, "License expiry is required"),
  contact: z.string().trim().optional(),
});

const updateDriverSchema = z.object({
  name: z.string().trim().min(1, "Name is required").optional(),
  userId: z.union([z.number().int().positive(), z.null()]).optional(),
  licenseNo: z.string().trim().min(1, "License number is required").optional(),
  category: z.string().trim().min(1, "Category is required").optional(),
  licenseExpiry: z.string().trim().min(1, "License expiry is required").optional(),
  contact: z.string().trim().optional(),
  status: z.enum(["AVAILABLE", "ON_TRIP", "OFF_DUTY", "SUSPENDED"]).optional(),
  isActive: z.boolean().optional(),
});

async function createDriver(req, res) {
  const parsedBody = createDriverSchema.safeParse(req.body);

  if (!parsedBody.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid request body",
      errors: parsedBody.error.flatten(),
    });
  }

  try {
    const createdDriver = await driverService.createDriver(parsedBody.data);

    return res.status(201).json({
      success: true,
      message: "Driver created successfully",
      data: createdDriver,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}

async function getDrivers(req, res) {
  try {
    const drivers = await driverService.getDrivers();
    return res.status(200).json({
      success: true,
      data: drivers,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}

async function updateDriver(req, res) {
  const driverId = parseInt(req.params.id, 10);
  if (Number.isNaN(driverId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid driver ID",
    });
  }

  const parsedBody = updateDriverSchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid request body",
      errors: parsedBody.error.flatten(),
    });
  }

  try {
    const updatedDriver = await driverService.updateDriver(driverId, parsedBody.data);
    return res.status(200).json({
      success: true,
      message: "Driver updated successfully",
      data: updatedDriver,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}

async function deleteDriver(req, res) {
  const driverId = parseInt(req.params.id, 10);
  if (Number.isNaN(driverId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid driver ID",
    });
  }

  try {
    await driverService.deleteDriver(driverId);
    return res.status(200).json({
      success: true,
      message: "Driver deleted successfully",
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}

module.exports = {
  createDriver,
  getDrivers,
  updateDriver,
  deleteDriver,
};