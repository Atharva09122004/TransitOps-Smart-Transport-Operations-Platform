const prisma = require("../config/prisma");

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function toNumber(value) {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "object" && typeof value.toNumber === "function") {
    return value.toNumber();
  }

  return Number(value) || 0;
}

function roundPercentage(numerator, denominator) {
  if (!denominator) {
    return 0;
  }

  return Math.round((numerator / denominator) * 100);
}

function getStartOfDay(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

function getStartOfYear(date = new Date()) {
  const start = new Date(date);
  start.setMonth(0, 1);
  start.setHours(0, 0, 0, 0);
  return start;
}

function getMonthKey(dateValue) {
  const date = new Date(dateValue);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function buildMonthlyCostSummary({ fuelLogs, maintenanceRecords, expenses }) {
  const buckets = new Map();

  const ensureBucket = (monthKey) => {
    if (!buckets.has(monthKey)) {
      buckets.set(monthKey, {
        month: monthKey,
        fuelCost: 0,
        maintenanceCost: 0,
        expenseCost: 0,
        totalCost: 0,
      });
    }

    return buckets.get(monthKey);
  };

  for (const fuelLog of fuelLogs) {
    const bucket = ensureBucket(getMonthKey(fuelLog.createdAt));
    bucket.fuelCost += toNumber(fuelLog.fuelCost);
    bucket.totalCost += toNumber(fuelLog.fuelCost);
  }

  for (const maintenanceRecord of maintenanceRecords) {
    const bucket = ensureBucket(getMonthKey(maintenanceRecord.createdAt));
    bucket.maintenanceCost += toNumber(maintenanceRecord.cost);
    bucket.totalCost += toNumber(maintenanceRecord.cost);
  }

  for (const expense of expenses) {
    const bucket = ensureBucket(getMonthKey(expense.createdAt));
    const expenseCost = toNumber(expense.tollCost) + toNumber(expense.otherCost);
    bucket.expenseCost += expenseCost;
    bucket.totalCost += expenseCost;
  }

  return Array.from(buckets.values()).sort((a, b) => a.month.localeCompare(b.month));
}

async function getSharedFleetMetrics() {
  const [
    totalVehicles,
    availableVehicles,
    vehiclesOnTrip,
    vehiclesInShop,
    totalDrivers,
    availableDrivers,
    driversOnTrip,
    totalTrips,
    draftTrips,
    dispatchedTrips,
    completedTrips,
    cancelledTrips,
    maintenanceCostResult,
    fuelCostResult,
    revenueSum,
    vehicleAcquisitionCostSum,
  ] = await Promise.all([
    prisma.vehicle.count({ where: { status: { not: "RETIRED" } } }),
    prisma.vehicle.count({ where: { status: "AVAILABLE" } }),
    prisma.vehicle.count({ where: { status: "ON_TRIP" } }),
    prisma.vehicle.count({ where: { status: "IN_SHOP" } }),
    prisma.driver.count({ where: { isActive: true } }),
    prisma.driver.count({ where: { isActive: true, status: "AVAILABLE" } }),
    prisma.driver.count({ where: { isActive: true, status: "ON_TRIP" } }),
    prisma.trip.count(),
    prisma.trip.count({ where: { status: "DRAFT" } }),
    prisma.trip.count({ where: { status: "DISPATCHED" } }),
    prisma.trip.count({ where: { status: "COMPLETED" } }),
    prisma.trip.count({ where: { status: "CANCELLED" } }),
    prisma.maintenanceRecord.aggregate({ _sum: { cost: true } }),
    prisma.fuelLog.aggregate({ _sum: { fuelCost: true } }),
    prisma.tripRevenue.aggregate({ _sum: { revenue: true } }),
    prisma.vehicle.aggregate({ _sum: { acquisitionCost: true } }),
  ]);

  const fuelCost = toNumber(fuelCostResult._sum.fuelCost);
  const maintenanceCost = toNumber(maintenanceCostResult._sum.cost);
  const operationalCost = fuelCost + maintenanceCost;
  const revenue = toNumber(revenueSum._sum.revenue);
  const totalAcquisitionCost = toNumber(vehicleAcquisitionCostSum._sum.acquisitionCost);
  const profit = revenue - operationalCost;
  const fleetUtilization = roundPercentage(vehiclesOnTrip, totalVehicles);
  const roi = totalAcquisitionCost > 0 ? Math.round((profit / totalAcquisitionCost) * 100) : 0;

  return {
    totalVehicles,
    availableVehicles,
    vehiclesOnTrip,
    vehiclesInShop,
    totalDrivers,
    availableDrivers,
    driversOnTrip,
    totalTrips,
    draftTrips,
    dispatchedTrips,
    completedTrips,
    cancelledTrips,
    fuelCost,
    maintenanceCost,
    operationalCost,
    revenue,
    fleetUtilization,
    roi,
  };
}

async function getFleetManagerDashboard() {
  const [shared, maintenanceCount, expensesSum] = await Promise.all([
    getSharedFleetMetrics(),
    prisma.maintenanceRecord.count(),
    prisma.expense.aggregate({ _sum: { tollCost: true, otherCost: true } }),
  ]);

  const totalExpenses = toNumber(expensesSum._sum.tollCost) + toNumber(expensesSum._sum.otherCost);

  return {
    ...shared,
    maintenanceCount,
    totalExpenses,
    // Backward-compatible alias used by older clients
    fuelExpenses: shared.fuelCost,
  };
}

async function getDispatcherDashboard() {
  const [shared, completedToday, recentTrips] = await Promise.all([
    getSharedFleetMetrics(),
    prisma.trip.count({
      where: { status: "COMPLETED", completedAt: { gte: getStartOfDay() } },
    }),
    prisma.trip.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        tripCode: true,
        source: true,
        destination: true,
        status: true,
        vehicle: { select: { regNo: true } },
        driver: { select: { name: true } },
      },
    }),
  ]);

  return {
    ...shared,
    completedToday,
    recentTrips,
  };
}

async function getSafetyOfficerDashboard() {
  const [
    shared,
    maintenanceRecords,
    upcomingMaintenance,
    averageSafetyScore,
  ] = await Promise.all([
    getSharedFleetMetrics(),
    prisma.maintenanceRecord.count(),
    prisma.maintenanceRecord.count({
      where: {
        status: "IN_SHOP",
        serviceDate: { gte: getStartOfDay() },
      },
    }),
    prisma.driver.aggregate({ _avg: { safetyScore: true } }),
  ]);

  return {
    ...shared,
    maintenanceRecords,
    upcomingMaintenance,
    safetyIncidents: 0,
    driverSafetyScores: Math.round(toNumber(averageSafetyScore._avg.safetyScore)),
    vehicleHealthSummary: {
      availableVehicles: shared.availableVehicles,
      onTripVehicles: shared.vehiclesOnTrip,
      inShopVehicles: shared.vehiclesInShop,
    },
  };
}

async function getFinancialDashboard() {
  const startOfYear = getStartOfYear();

  const [
    shared,
    expensesSum,
    fuelLogs,
    maintenanceRecords,
    expenses,
  ] = await Promise.all([
    getSharedFleetMetrics(),
    prisma.expense.aggregate({ _sum: { tollCost: true, otherCost: true } }),
    prisma.fuelLog.findMany({
      where: { createdAt: { gte: startOfYear } },
      select: { createdAt: true, fuelCost: true },
    }),
    prisma.maintenanceRecord.findMany({
      where: { createdAt: { gte: startOfYear } },
      select: { createdAt: true, cost: true },
    }),
    prisma.expense.findMany({
      where: { createdAt: { gte: startOfYear } },
      select: { createdAt: true, tollCost: true, otherCost: true },
    }),
  ]);

  const expenseBreakdown = {
    tollCost: toNumber(expensesSum._sum.tollCost),
    otherCost: toNumber(expensesSum._sum.otherCost),
  };

  return {
    ...shared,
    tripsCompleted: shared.completedTrips,
    expenseBreakdown,
    monthlyCostSummary: buildMonthlyCostSummary({ fuelLogs, maintenanceRecords, expenses }),
  };
}

async function getDashboard(user) {
  switch (user.role) {
    case "FLEET_MANAGER":
      return getFleetManagerDashboard();
    case "DISPATCHER":
      return getDispatcherDashboard();
    case "SAFETY_OFFICER":
      return getSafetyOfficerDashboard();
    case "FINANCIAL_ANALYST":
      return getFinancialDashboard();
    default:
      throw createHttpError(403, "Access denied");
  }
}

module.exports = {
  getDashboard,
  getStats: getDashboard,
};
