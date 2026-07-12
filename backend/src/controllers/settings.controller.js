const { updateSettingsSchema } = require("../validators/settings.validator");
const settingsService = require("../services/settings.service");

async function getSettings(req, res) {
  try {
    const data = await settingsService.getSettings();
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}

async function updateSettings(req, res) {
  const parsed = updateSettingsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const data = await settingsService.updateSettings(parsed.data);
    return res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}

module.exports = {
  getSettings,
  updateSettings,
};
