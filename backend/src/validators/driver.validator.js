const { z } = require("zod");

const createDriverSchema = z.object({
  name: z.string().trim().min(1),
  userId: z.union([z.number().int().positive(), z.null()]).optional(),
  licenseNo: z.string().trim().min(1),
  category: z.string().trim().min(1),
  licenseExpiry: z.string().trim().min(1),
  contact: z.string().trim().optional(),
});

module.exports = {
  createDriverSchema,
};