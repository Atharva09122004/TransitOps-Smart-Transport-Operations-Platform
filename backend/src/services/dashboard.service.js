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

async function getFleetManagerDashboard() {
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
    maintenanceCount,
    maintenanceCostResult,
    fuelExpenses,
    expensesSum,
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
    prisma.maintenanceRecord.count(),
    prisma.maintenanceRecord.aggregate({ _sum: { cost: true } }),
    prisma.fuelLog.aggregate({ _sum: { fuelCost: true } }),
    prisma.expense.aggregate({ _sum: { tollCost: true, otherCost: true } }),
    prisma.tripRevenue.aggregate({ _sum: { revenue: true } }),
    prisma.vehicle.aggregate({ _sum: { acquisitionCost: true } }),
  ]);

  const totalFuelExpenses = toNumber(fuelExpenses._sum.fuelCost);
  const totalExpenses = toNumber(expensesSum._sum.tollCost) + toNumber(expensesSum._sum.otherCost);
  const maintenanceCost = toNumber(maintenanceCostResult._sum.cost);
  const operationalCost = totalFuelExpenses + maintenanceCost;
  const revenue = toNumber(revenueSum._sum.revenue);
  const totalAcquisitionCost = toNumber(vehicleAcquisitionCostSum._sum.acquisitionCost);
  const profit = revenue - (totalFuelExpenses + maintenanceCost);
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
    maintenanceCount,
    maintenanceCost,
    fuelExpenses: totalFuelExpenses,
    operationalCost,
    revenue,
    fleetUtilization,
    roi,
  };
}

async function getDriverDashboard(userId) {
  const driver = await prisma.driver.findFirst({
    where: { userId },
    select: { id: true, safetyScore: true },
  });

  if (!driver) {
    throw createHttpError(404, "Driver profile not found");
  }

  const todayStart = getStartOfDay();

  const [assignedTrips, completedTrips, currentTrip, todayDistance, fuelLogsSubmitted, expensesSubmitted] = await Promise.all([
    prisma.trip.count({ where: { driverId: driver.id } }),
    prisma.trip.count({ where: { driverId: driver.id, status: "COMPLETED" } }),
    prisma.trip.findFirst({
      where: { driverId: driver.id },
      orderBy: { updatedAt: "desc" },
      select: { status: true },
    }),
    prisma.trip.aggregate({
      where: {
        driverId: driver.id,
        completedAt: { gte: todayStart },
      },
      _sum: { actualDistanceKm: true },
    }),
    prisma.fuelLog.count({
      where: {
        trip: { driverId: driver.id },
      },
    }),
    prisma.expense.count({
      where: {
        trip: { driverId: driver.id },
      },
    }),
  ]);

  return {
    assignedTrips,
    completedTrips,
    currentTripStatus: currentTrip ? currentTrip.status : null,
    todayDistance: toNumber(todayDistance._sum.actualDistanceKm),
    safetyScore: driver.safetyScore,
    fuelLogsSubmitted,
    expensesSubmitted,
  };
}

async function getSafetyOfficerDashboard() {
  const [
    maintenanceRecords,
    vehiclesInShop,
    upcomingMaintenance,
    driversOnTrip,
    averageSafetyScore,
    availableVehicles,
    onTripVehicles,
    inShopVehicles,
  ] = await Promise.all([
    prisma.maintenanceRecord.count(),
    prisma.vehicle.count({ where: { status: "IN_SHOP" } }),
    prisma.maintenanceRecord.count({
      where: {
        status: "IN_SHOP",
        serviceDate: { gte: getStartOfDay() },
      },
    }),
    prisma.driver.count({ where: { isActive: true, status: "ON_TRIP" } }),
    prisma.driver.aggregate({ _avg: { safetyScore: true } }),
    prisma.vehicle.count({ where: { status: "AVAILABLE" } }),
    prisma.vehicle.count({ where: { status: "ON_TRIP" } }),
    prisma.vehicle.count({ where: { status: "IN_SHOP" } }),
  ]);

  return {
    maintenanceRecords,
    vehiclesInShop,
    upcomingMaintenance,
    safetyIncidents: 0,
    driversOnTrip,
    driverSafetyScores: Math.round(toNumber(averageSafetyScore._avg.safetyScore)),
    vehicleHealthSummary: {
      availableVehicles,
      onTripVehicles,
      inShopVehicles,
    },
  };
}

async function getFinancialDashboard() {
  const startOfYear = getStartOfYear();

  const [
    revenueSum,
    fuelCostSum,
    maintenanceCostSum,
    expensesSum,
    vehicleAcquisitionCostSum,
    tripsCompleted,
    fuelLogs,
    maintenanceRecords,
    expenses,
  ] = await Promise.all([
    prisma.tripRevenue.aggregate({ _sum: { revenue: true } }),
    prisma.fuelLog.aggregate({ _sum: { fuelCost: true } }),
    prisma.maintenanceRecord.aggregate({ _sum: { cost: true } }),
    prisma.expense.aggregate({ _sum: { tollCost: true, otherCost: true } }),
    prisma.vehicle.aggregate({ _sum: { acquisitionCost: true } }),
    prisma.trip.count({ where: { status: "COMPLETED" } }),
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

  const revenue = toNumber(revenueSum._sum.revenue);
  const fuelCost = toNumber(fuelCostSum._sum.fuelCost);
  const maintenanceCost = toNumber(maintenanceCostSum._sum.cost);
  const expenseBreakdown = {
    tollCost: toNumber(expensesSum._sum.tollCost),
    otherCost: toNumber(expensesSum._sum.otherCost),
  };
  const operationalCost = fuelCost + maintenanceCost;
  const totalAcquisitionCost = toNumber(vehicleAcquisitionCostSum._sum.acquisitionCost);
  const profit = revenue - (fuelCost + maintenanceCost);
  const roi = totalAcquisitionCost > 0 ? Math.round((profit / totalAcquisitionCost) * 100) : 0;

  return {
    revenue,
    fuelCost,
    maintenanceCost,
    operationalCost,
    roi,
    expenseBreakdown,
    tripsCompleted,
    monthlyCostSummary: buildMonthlyCostSummary({ fuelLogs, maintenanceRecords, expenses }),
  };
}

async function getDashboard(user) {
  switch (user.role) {
    case "FLEET_MANAGER":
      return getFleetManagerDashboard();
    case "DRIVER":
      return getDriverDashboard(user.id);
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
