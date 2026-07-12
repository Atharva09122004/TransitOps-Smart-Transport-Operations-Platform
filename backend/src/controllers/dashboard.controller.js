const dashboardService = require("../services/dashboard.service");

async function getStats(req, res) {
  try {
    const dashboard = await dashboardService.getDashboard(req.user);
    return res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}

module.exports = {
  getStats,
  getDashboard: getStats,
};
