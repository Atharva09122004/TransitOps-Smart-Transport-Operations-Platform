const { z } = require("zod");

const tripIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const createTripSchema = z.object({
  tripCode: z.string().trim().min(1, "Trip code is required"),
  source: z.string().trim().min(1, "Source is required"),
  destination: z.string().trim().min(1, "Destination is required"),
  vehicleId: z.coerce.number().int().positive(),
  driverId: z.coerce.number().int().positive(),
  cargoWeightKg: z.coerce.number().positive("Cargo weight must be greater than 0"),
  plannedDistanceKm: z.coerce.number().positive("Planned distance must be greater than 0"),
  etaMinutes: z.coerce.number().int().positive("ETA must be greater than 0"),
});

const updateTripSchema = z.object({
  destination: z.string().trim().min(1).optional(),
  plannedDistanceKm: z.coerce.number().positive().optional(),
  etaMinutes: z.coerce.number().int().positive().optional(),
  cargoWeightKg: z.coerce.number().positive().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field is required",
});

const dispatchTripSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const completeTripSchema = z.object({
  actualDistanceKm: z.coerce.number().positive("Actual distance must be greater than 0"),
});

const cancelTripSchema = z.object({
  cancelledReason: z.string().trim().min(1, "Cancelled reason is required"),
});

module.exports = {
  tripIdParamSchema,
  createTripSchema,
  updateTripSchema,
  dispatchTripSchema,
  completeTripSchema,
  cancelTripSchema,
};