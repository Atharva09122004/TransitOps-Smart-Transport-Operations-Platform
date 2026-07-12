const { z } = require("zod");

const createMaintenanceSchema = z.object({
  vehicleId: z.number({ required_error: "Vehicle ID is required" }).int().positive(),
  serviceType: z.string({ required_error: "Service type is required" }).trim().min(2, "Service type must be at least 2 characters"),
  cost: z.number().nonnegative("Cost must be non-negative").default(0),
  serviceDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

const updateMaintenanceSchema = z.object({
  serviceType: z.string().trim().min(2, "Service type must be at least 2 characters").optional(),
  cost: z.number().nonnegative("Cost must be non-negative").optional(),
  serviceDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

module.exports = {
  createMaintenanceSchema,
  updateMaintenanceSchema,
};
