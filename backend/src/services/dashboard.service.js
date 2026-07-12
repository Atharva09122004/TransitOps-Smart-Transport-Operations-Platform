const prisma = require("../config/prisma");

async function getStats() {
  const [
    activeVehicles,
    vehiclesOnTrip,
    vehiclesInShop,
    activeTrips,
    driversAvailable,
    fuelCostSum,
    maintenanceCostSum
  ] = await Promise.all([
    prisma.vehicle.count({ where: { NOT: { status: "RETIRED" } } }),
    prisma.vehicle.count({ where: { status: "ON_TRIP" } }),
    prisma.vehicle.count({ where: { status: "IN_SHOP" } }),
    prisma.trip.count({ where: { status: "DISPATCHED" } }),
    prisma.driver.count({ where: { status: "AVAILABLE", isActive: true } }),
    prisma.fuelLog.aggregate({ _sum: { fuelCost: true } }),
    prisma.maintenanceRecord.aggregate({ _sum: { cost: true } })
  ]);

  const fleetUtilization = activeVehicles > 0
    ? Math.round((vehiclesOnTrip / activeVehicles) * 100)
    : 0;

  return {
    activeVehicles,
    vehiclesInShop,
    activeTrips,
    driversAvailable,
    fleetUtilization,
    fuelCost: fuelCostSum._sum.fuelCost ? Number(fuelCostSum._sum.fuelCost) : 0,
    maintenanceCost: maintenanceCostSum._sum.cost ? Number(maintenanceCostSum._sum.cost) : 0
  };
}

module.exports = {
  getStats,
};
