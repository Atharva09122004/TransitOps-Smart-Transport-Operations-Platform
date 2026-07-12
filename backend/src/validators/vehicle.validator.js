const { z } = require("zod");

const createVehicleSchema = z.object({
  regNo: z.string({ required_error: "Registration number is required" }).trim().min(1, "Registration number cannot be empty"),
  modelName: z.string({ required_error: "Model name is required" }).trim().min(1, "Model name cannot be empty"),
  type: z.enum(["VAN", "TRUCK", "MINI"], {
    errorMap: () => ({ message: "Invalid vehicle type. Allowed types: VAN, TRUCK, MINI" }),
  }),
  capacityKg: z.number({ required_error: "Capacity is required" }).gt(0, "Capacity must be greater than 0"),
  odometerKm: z.number().nonnegative("Odometer must be greater than or equal to 0").default(0),
  acquisitionCost: z.number().nonnegative("Acquisition cost must be greater than or equal to 0").default(0),
});

const updateVehicleSchema = z.object({
  regNo: z.string().trim().min(1, "Registration number cannot be empty").optional(),
  modelName: z.string().trim().min(1, "Model name cannot be empty").optional(),
  type: z.enum(["VAN", "TRUCK", "MINI"], {
    errorMap: () => ({ message: "Invalid vehicle type. Allowed types: VAN, TRUCK, MINI" }),
  }).optional(),
  capacityKg: z.number().gt(0, "Capacity must be greater than 0").optional(),
  odometerKm: z.number().nonnegative("Odometer must be greater than or equal to 0").optional(),
  acquisitionCost: z.number().nonnegative("Acquisition cost must be greater than or equal to 0").optional(),
  status: z.enum(["AVAILABLE", "ON_TRIP", "IN_SHOP", "RETIRED"], {
    errorMap: () => ({ message: "Invalid vehicle status" }),
  }).optional(),
});

const queryVehicleSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["AVAILABLE", "ON_TRIP", "IN_SHOP", "RETIRED"]).optional(),
  type: z.enum(["VAN", "TRUCK", "MINI"]).optional(),
});

module.exports = {
  createVehicleSchema,
  updateVehicleSchema,
  queryVehicleSchema,
};
