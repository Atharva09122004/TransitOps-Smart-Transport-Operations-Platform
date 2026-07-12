const prisma = require("../config/prisma");

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function createMaintenance(data) {
  // Validate if vehicle exists
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: data.vehicleId },
  });

  if (!vehicle) {
    throw createHttpError(404, "Vehicle not found");
  }

  // Transaction to create maintenance record and update vehicle status
  return prisma.$transaction(async (tx) => {
    const record = await tx.maintenanceRecord.create({
      data: {
        vehicleId: data.vehicleId,
        serviceType: data.serviceType,
        cost: data.cost ?? 0,
        serviceDate: data.serviceDate ? new Date(data.serviceDate) : new Date(),
        notes: data.notes,
        status: "IN_SHOP",
      },
    });

    if (vehicle.status !== "IN_SHOP") {
      await tx.vehicle.update({
        where: { id: data.vehicleId },
        data: { status: "IN_SHOP" },
      });
    }

    return record;
  });
}

async function getAllMaintenance() {
  const records = await prisma.maintenanceRecord.findMany({
    include: {
      vehicle: {
        select: {
          regNo: true,
          modelName: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return records.map(record => ({
    ...record,
    cost: record.cost ? Number(record.cost) : 0,
  }));
}

async function updateMaintenance(id, data) {
  const record = await prisma.maintenanceRecord.findUnique({
    where: { id },
  });

  if (!record) {
    throw createHttpError(404, "Maintenance record not found");
  }

  if (record.status === "COMPLETED") {
    throw createHttpError(400, "Cannot update a completed maintenance record");
  }

  const updated = await prisma.maintenanceRecord.update({
    where: { id },
    data: {
      serviceType: data.serviceType,
      cost: data.cost,
      serviceDate: data.serviceDate ? new Date(data.serviceDate) : undefined,
      notes: data.notes,
    },
  });

  return {
    ...updated,
    cost: updated.cost ? Number(updated.cost) : 0,
  };
}

async function completeMaintenance(id) {
  const record = await prisma.maintenanceRecord.findUnique({
    where: { id },
  });

  if (!record) {
    throw createHttpError(404, "Maintenance record not found");
  }

  if (record.status === "COMPLETED") {
    throw createHttpError(400, "Maintenance record is already completed");
  }

  return prisma.$transaction(async (tx) => {
    const updatedRecord = await tx.maintenanceRecord.update({
      where: { id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    // Check if the vehicle has any other active maintenance records
    const activeRecords = await tx.maintenanceRecord.count({
      where: {
        vehicleId: record.vehicleId,
        status: "IN_SHOP",
      },
    });

    if (activeRecords === 0) {
      await tx.vehicle.update({
        where: { id: record.vehicleId },
        data: { status: "AVAILABLE" },
      });
    }

    return {
      ...updatedRecord,
      cost: updatedRecord.cost ? Number(updatedRecord.cost) : 0,
    };
  });
}

module.exports = {
  createMaintenance,
  getAllMaintenance,
  updateMaintenance,
  completeMaintenance,
};
