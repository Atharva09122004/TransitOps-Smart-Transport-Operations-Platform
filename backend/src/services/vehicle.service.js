const prisma = require("../config/prisma");

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function formatVehicle(vehicle) {
  if (!vehicle) return null;
  
  const maintenanceCost = vehicle.maintenanceRecords
    ? vehicle.maintenanceRecords.reduce((sum, r) => sum + Number(r.cost), 0)
    : 0;
  const fuelCost = vehicle.fuelLogs
    ? vehicle.fuelLogs.reduce((sum, l) => sum + Number(l.fuelCost), 0)
    : 0;
  const expensesCost = vehicle.expenses
    ? vehicle.expenses.reduce((sum, e) => sum + Number(e.tollCost) + Number(e.otherCost), 0)
    : 0;
  const operationalCost = maintenanceCost + fuelCost + expensesCost;

  return {
    ...vehicle,
    capacityKg: vehicle.capacityKg ? Number(vehicle.capacityKg) : 0,
    odometerKm: vehicle.odometerKm ? Number(vehicle.odometerKm) : 0,
    acquisitionCost: vehicle.acquisitionCost ? Number(vehicle.acquisitionCost) : 0,
    fuelCost,
    maintenanceCost,
    operationalCost
  };
}

async function createVehicle(data) {
  const existing = await prisma.vehicle.findUnique({
    where: { regNo: data.regNo },
  });

  if (existing) {
    throw createHttpError(400, "Registration number already exists");
  }

  const vehicle = await prisma.vehicle.create({
    data: {
      regNo: data.regNo,
      modelName: data.modelName,
      type: data.type,
      capacityKg: data.capacityKg,
      odometerKm: data.odometerKm ?? 0,
      acquisitionCost: data.acquisitionCost ?? 0,
      status: "AVAILABLE",
    },
  });

  return formatVehicle(vehicle);
}

async function getAllVehicles(filters = {}) {
  const where = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.search) {
    where.OR = [
      { regNo: { contains: filters.search, mode: "insensitive" } },
      { modelName: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const vehicles = await prisma.vehicle.findMany({
    where,
    include: {
      maintenanceRecords: { select: { cost: true } },
      fuelLogs: { select: { fuelCost: true, liters: true, logDate: true } },
      expenses: { select: { tollCost: true, otherCost: true } },
      trips: {
        select: {
          status: true,
          actualDistanceKm: true,
          revenue: { select: { revenue: true } }
        }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return vehicles.map(formatVehicle);
}

async function getVehicleById(id) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      maintenanceRecords: { select: { cost: true } },
      fuelLogs: { select: { fuelCost: true, liters: true, logDate: true } },
      expenses: { select: { tollCost: true, otherCost: true } },
      trips: {
        select: {
          status: true,
          actualDistanceKm: true,
          revenue: { select: { revenue: true } }
        }
      }
    },
  });

  if (!vehicle) {
    throw createHttpError(404, "Vehicle not found");
  }

  return formatVehicle(vehicle);
}

async function updateVehicle(id, data) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
  });

  if (!vehicle) {
    throw createHttpError(404, "Vehicle not found");
  }

  if (data.regNo && data.regNo !== vehicle.regNo) {
    const existing = await prisma.vehicle.findUnique({
      where: { regNo: data.regNo },
    });

    if (existing) {
      throw createHttpError(400, "Registration number already exists");
    }
  }

  const updated = await prisma.vehicle.update({
    where: { id },
    data,
  });

  return formatVehicle(updated);
}

async function deleteVehicle(id) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      _count: {
        select: { trips: true },
      },
    },
  });

  if (!vehicle) {
    throw createHttpError(404, "Vehicle not found");
  }

  if (vehicle._count.trips > 0) {
    const updated = await prisma.vehicle.update({
      where: { id },
      data: { status: "RETIRED" },
    });

    return {
      success: true,
      message: "Vehicle has associated trips and cannot be hard deleted. It has been marked as RETIRED.",
      vehicle: formatVehicle(updated),
    };
  }

  await prisma.vehicle.delete({
    where: { id },
  });

  return {
    success: true,
    message: "Vehicle deleted successfully.",
  };
}

module.exports = {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
};
