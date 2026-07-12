const { z } = require("zod");

const createExpenseSchema = z.object({
  tripId: z.number({ required_error: "Trip ID is required" }).int().positive(),
  vehicleId: z.number({ required_error: "Vehicle ID is required" }).int().positive(),
  tollCost: z.number().nonnegative().default(0),
  otherCost: z.number().nonnegative().default(0),
  maintenanceCleared: z.boolean().default(false),
  status: z.enum(["PENDING", "APPROVED", "PAID"]).default("PENDING"),
});

module.exports = {
  createExpenseSchema,
};
