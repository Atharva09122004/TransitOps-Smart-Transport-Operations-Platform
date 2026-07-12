const reportService = require("../services/report.service");

async function getReport(req, res) {
  try {
    const reportData = await reportService.getAnalyticsReport();
    return res.status(200).json({
      success: true,
      data: reportData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}

module.exports = {
  getReport,
};
