const prisma = require("../config/prisma");

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function createExpense(data) {
  const trip = await prisma.trip.findUnique({
    where: { id: data.tripId },
  });

  if (!trip) {
    throw createHttpError(404, "Trip not found");
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: data.vehicleId },
  });

  if (!vehicle) {
    throw createHttpError(404, "Vehicle not found");
  }

  const expense = await prisma.expense.create({
    data: {
      tripId: data.tripId,
      vehicleId: data.vehicleId,
      tollCost: data.tollCost ?? 0,
      otherCost: data.otherCost ?? 0,
      maintenanceCleared: data.maintenanceCleared ?? false,
      status: data.status ?? "PENDING",
    },
  });

  return {
    ...expense,
    tollCost: Number(expense.tollCost),
    otherCost: Number(expense.otherCost),
  };
}

async function getAllExpenses() {
  const expenses = await prisma.expense.findMany({
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
    orderBy: { createdAt: "desc" },
  });

  return expenses.map(expense => ({
    ...expense,
    tollCost: Number(expense.tollCost),
    otherCost: Number(expense.otherCost),
  }));
}

module.exports = {
  createExpense,
  getAllExpenses,
};
