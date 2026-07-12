const prisma = require("../config/prisma");

const ALLOWED_UPDATE_FIELDS = ["destination", "plannedDistanceKm", "etaMinutes", "cargoWeightKg"];

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function toNumber(value) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "object" && typeof value.toNumber === "function") {
    return value.toNumber();
  }

  return Number(value);
}

function normalizeTrip(trip) {
  return {
    id: trip.id,
    tripCode: trip.tripCode,
    source: trip.source,
    destination: trip.destination,
    vehicleId: trip.vehicleId,
    driverId: trip.driverId,
    cargoWeightKg: toNumber(trip.cargoWeightKg),
    plannedDistanceKm: trip.plannedDistanceKm === null ? null : toNumber(trip.plannedDistanceKm),
    actualDistanceKm: trip.actualDistanceKm === null ? null : toNumber(trip.actualDistanceKm),
    status: trip.status,
    etaMinutes: trip.etaMinutes,
    dispatchedAt: trip.dispatchedAt,
    completedAt: trip.completedAt,
    cancelledReason: trip.cancelledReason,
    remarks: trip.remarks,
    createdAt: trip.createdAt,
    updatedAt: trip.updatedAt,
    vehicle: trip.vehicle
      ? {
          id: trip.vehicle.id,
          regNo: trip.vehicle.regNo,
          modelName: trip.vehicle.modelName,
          type: trip.vehicle.type,
          capacityKg: toNumber(trip.vehicle.capacityKg),
          status: trip.vehicle.status,
        }
      : null,
    driver: trip.driver
      ? {
          id: trip.driver.id,
          name: trip.driver.name,
          licenseNo: trip.driver.licenseNo,
          category: trip.driver.category,
          licenseExpiry: trip.driver.licenseExpiry,
          status: trip.driver.status,
        }
      : null,
    fuelLogs: trip.fuelLogs || [],
    expenses: trip.expenses || [],
    revenue: trip.revenue || null,
  };
}

async function createTrip(payload) {
  // Trip creation RBAC remains FLEET_MANAGER-only (see trip.routes.js); broader roles are a separate product decision.
  const { tripCode, source, destination, vehicleId, driverId, cargoWeightKg, plannedDistanceKm, etaMinutes } = payload;

  const existingTrip = await prisma.trip.findUnique({ where: { tripCode } });
  if (existingTrip) {
    throw createHttpError(409, "Trip code already exists");
  }

  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) {
    throw createHttpError(404, "Vehicle not found");
  }

  const driver = await prisma.driver.findUnique({ where: { id: driverId } });
  if (!driver) {
    throw createHttpError(404, "Driver not found");
  }

  if (vehicle.status !== "AVAILABLE") {
    throw createHttpError(400, "Vehicle is not available");
  }

  if (driver.status !== "AVAILABLE") {
    throw createHttpError(400, "Driver is not available");
  }

  if (driver.licenseExpiry < new Date()) {
    throw createHttpError(400, "Driver license has expired");
  }

  const cargoWeight = toNumber(cargoWeightKg);
  const vehicleCapacity = toNumber(vehicle.capacityKg);

  if (cargoWeight > vehicleCapacity) {
    throw createHttpError(400, "Cargo weight exceeds vehicle capacity");
  }

  const trip = await prisma.trip.create({
    data: {
      tripCode,
      source,
      destination,
      vehicleId,
      driverId,
      cargoWeightKg,
      plannedDistanceKm,
      etaMinutes,
    },
  });

  return normalizeTrip(trip);
}

async function getAllTrips() {
  const trips = await prisma.trip.findMany({
    include: {
      vehicle: true,
      driver: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return trips.map((trip) => ({
    id: trip.id,
    tripCode: trip.tripCode,
    source: trip.source,
    destination: trip.destination,
    vehicle: trip.vehicle ? { regNo: trip.vehicle.regNo } : null,
    driver: trip.driver ? { name: trip.driver.name } : null,
    status: trip.status,
  }));
}

async function getTripById(id) {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      vehicle: true,
      driver: true,
      fuelLogs: true,
      expenses: true,
      revenue: true,
    },
  });

  if (!trip) {
    throw createHttpError(404, "Trip not found");
  }

  return normalizeTrip(trip);
}

async function updateTrip(id, payload) {
  const trip = await prisma.trip.findUnique({ where: { id } });

  if (!trip) {
    throw createHttpError(404, "Trip not found");
  }

  if (trip.status === "COMPLETED") {
    throw createHttpError(400, "Completed trips cannot be updated");
  }

  const updateData = {};

  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (payload[field] !== undefined) {
      updateData[field] = payload[field];
    }
  }

  const updatedTrip = await prisma.trip.update({
    where: { id },
    data: updateData,
  });

  return normalizeTrip(updatedTrip);
}

async function dispatchTrip(id) {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      vehicle: true,
      driver: true,
    },
  });

  if (!trip) {
    throw createHttpError(404, "Trip not found");
  }

  if (trip.status !== "DRAFT") {
    throw createHttpError(400, "Only draft trips can be dispatched");
  }

  if (!trip.vehicle) {
    throw createHttpError(404, "Vehicle not found");
  }

  if (!trip.driver) {
    throw createHttpError(404, "Driver not found");
  }

  if (trip.vehicle.status !== "AVAILABLE") {
    throw createHttpError(400, "Vehicle is not available");
  }

  if (trip.driver.status !== "AVAILABLE") {
    throw createHttpError(400, "Driver is not available");
  }

  if (trip.driver.licenseExpiry < new Date()) {
    throw createHttpError(400, "Driver license has expired");
  }

  const cargoWeight = toNumber(trip.cargoWeightKg);
  const vehicleCapacity = toNumber(trip.vehicle.capacityKg);

  if (cargoWeight > vehicleCapacity) {
    throw createHttpError(400, "Cargo weight exceeds vehicle capacity");
  }

  const updatedTrip = await prisma.$transaction(async (tx) => {
    const tripResult = await tx.trip.update({
      where: { id },
      data: {
        status: "DISPATCHED",
        dispatchedAt: new Date(),
      },
      include: {
        vehicle: true,
        driver: true,
        fuelLogs: true,
        expenses: true,
        revenue: true,
      },
    });

    await tx.vehicle.update({
      where: { id: trip.vehicleId },
      data: { status: "ON_TRIP" },
    });

    await tx.driver.update({
      where: { id: trip.driverId },
      data: { status: "ON_TRIP" },
    });

    return tripResult;
  });

  return normalizeTrip(updatedTrip);
}

async function completeTrip(id, actualDistanceKm) {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      vehicle: true,
      driver: true,
    },
  });

  if (!trip) {
    throw createHttpError(404, "Trip not found");
  }

  if (trip.status === "CANCELLED") {
    throw createHttpError(400, "Cancelled trips cannot be completed");
  }

  if (trip.status !== "DISPATCHED") {
    throw createHttpError(400, "Only dispatched trips can be completed");
  }

  const updatedTrip = await prisma.$transaction(async (tx) => {
    const tripResult = await tx.trip.update({
      where: { id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        actualDistanceKm,
      },
      include: {
        vehicle: true,
        driver: true,
        fuelLogs: true,
        expenses: true,
        revenue: true,
      },
    });

    if (trip.vehicleId) {
      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: "AVAILABLE" },
      });
    }

    if (trip.driverId) {
      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: "AVAILABLE" },
      });
    }

    return tripResult;
  });

  return normalizeTrip(updatedTrip);
}

async function cancelTrip(id, cancelledReason) {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      vehicle: true,
      driver: true,
    },
  });

  if (!trip) {
    throw createHttpError(404, "Trip not found");
  }

  if (trip.status === "COMPLETED") {
    throw createHttpError(400, "Completed trips cannot be cancelled");
  }

  const wasDispatched = trip.status === "DISPATCHED";

  const updatedTrip = await prisma.$transaction(async (tx) => {
    const tripResult = await tx.trip.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelledReason,
      },
      include: {
        vehicle: true,
        driver: true,
        fuelLogs: true,
        expenses: true,
        revenue: true,
      },
    });

    if (wasDispatched && trip.vehicleId) {
      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: "AVAILABLE" },
      });
    }

    if (wasDispatched && trip.driverId) {
      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: "AVAILABLE" },
      });
    }

    return tripResult;
  });

  return normalizeTrip(updatedTrip);
}

module.exports = {
  createTrip,
  getAllTrips,
  getTripById,
  updateTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
};