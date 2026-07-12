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

module.exports = {
  createDriver,
};