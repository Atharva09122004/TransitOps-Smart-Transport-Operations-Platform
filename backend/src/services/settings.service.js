const prisma = require("../config/prisma");

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

// Static RBAC matrix for the UI
const RBAC_MATRIX = [
  { role: "Fleet Manager", fleet: true, drivers: true, trips: false, fuelExp: false, analytics: true },
  { role: "Dispatcher", fleet: "view", drivers: false, trips: true, fuelExp: false, analytics: false },
  { role: "Safety Officer", fleet: false, drivers: true, trips: "view", fuelExp: false, analytics: false },
  { role: "Financial Analyst", fleet: "view", drivers: false, trips: false, fuelExp: true, analytics: true },
];

async function getSettings() {
  let settings = await prisma.systemSettings.findFirst();
  
  if (!settings) {
    settings = await prisma.systemSettings.create({
      data: {} // Uses defaults from schema
    });
  }

  return {
    general: settings,
    rbac: RBAC_MATRIX,
  };
}

async function updateSettings(data) {
  let settings = await prisma.systemSettings.findFirst();
  
  if (!settings) {
    settings = await prisma.systemSettings.create({
      data,
    });
  } else {
    settings = await prisma.systemSettings.update({
      where: { id: settings.id },
      data,
    });
  }

  return {
    general: settings,
    rbac: RBAC_MATRIX,
  };
}

module.exports = {
  getSettings,
  updateSettings,
};
