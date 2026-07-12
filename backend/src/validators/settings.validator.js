const { z } = require("zod");

const updateSettingsSchema = z.object({
  depotName: z.string().min(1, "Depot Name is required").optional(),
  currency: z.string().min(1, "Currency is required").optional(),
  distanceUnit: z.string().min(1, "Distance Unit is required").optional(),
});

module.exports = {
  updateSettingsSchema,
};
