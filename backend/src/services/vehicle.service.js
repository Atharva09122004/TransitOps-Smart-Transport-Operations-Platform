const prisma = require("../config/prisma");

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function formatVehicle(vehicle) {
  if (!vehicle) return null;
  return {
    ...vehicle,
    capacityKg: vehicle.capacityKg ? Number(vehicle.capacityKg) : 0,
    odometerKm: vehicle.odometerKm ? Number(vehicle.odometerKm) : 0,
    acquisitionCost: vehicle.acquisitionCost ? Number(vehicle.acquisitionCost) : 0,
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
    orderBy: { createdAt: "desc" },
  });

  return vehicles.map(formatVehicle);
}

async function getVehicleById(id) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
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
