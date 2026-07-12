const { z } = require("zod");

const createFuelSchema = z.object({
  vehicleId: z.number({ required_error: "Vehicle ID is required" }).int().positive(),
  tripId: z.number().int().positive().optional(),
  logDate: z.string().datetime().optional(),
  odometerKm: z.number({ required_error: "Odometer is required" }).nonnegative(),
  liters: z.number({ required_error: "Liters is required" }).nonnegative(),
  fuelCost: z.number({ required_error: "Fuel cost is required" }).nonnegative(),
  remarks: z.string().optional(),
});

module.exports = {
  createFuelSchema,
};
