const prisma = require("../config/prisma");

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function createFuelLog(data) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: data.vehicleId },
  });

  if (!vehicle) {
    throw createHttpError(404, "Vehicle not found");
  }

  if (data.tripId) {
    const trip = await prisma.trip.findUnique({
      where: { id: data.tripId },
    });
    if (!trip) {
      throw createHttpError(404, "Trip not found");
    }
  }

  const log = await prisma.fuelLog.create({
    data: {
      vehicleId: data.vehicleId,
      tripId: data.tripId,
      logDate: data.logDate ? new Date(data.logDate) : new Date(),
      odometerKm: data.odometerKm,
      liters: data.liters,
      fuelCost: data.fuelCost,
      remarks: data.remarks,
    },
  });

  if (data.odometerKm > vehicle.odometerKm) {
    await prisma.vehicle.update({
      where: { id: data.vehicleId },
      data: { odometerKm: data.odometerKm },
    });
  }

  return {
    ...log,
    odometerKm: Number(log.odometerKm),
    liters: Number(log.liters),
    fuelCost: Number(log.fuelCost),
  };
}

async function getAllFuelLogs() {
  const logs = await prisma.fuelLog.findMany({
    include: {
      vehicle: {
        select: {
          regNo: true,
          modelName: true,
        },
      },
      trip: {
        select: {
          tripCode: true,
        },
      },
    },
    orderBy: { logDate: "desc" },
  });

  return logs.map(log => ({
    ...log,
    odometerKm: Number(log.odometerKm),
    liters: Number(log.liters),
    fuelCost: Number(log.fuelCost),
  }));
}

module.exports = {
  createFuelLog,
  getAllFuelLogs,
};
