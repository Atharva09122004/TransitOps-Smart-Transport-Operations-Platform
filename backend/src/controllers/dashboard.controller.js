const dashboardService = require("../services/dashboard.service");

async function getStats(req, res) {
  try {
    const stats = await dashboardService.getStats();
    return res.status(200).json(stats);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}

module.exports = {
  getStats,
};
