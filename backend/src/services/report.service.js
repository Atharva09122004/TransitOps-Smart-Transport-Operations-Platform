const prisma = require("../config/prisma");

async function getAnalyticsReport() {
  // 1. Fuel Efficiency (Total Distance / Total Fuel Liters)
  const trips = await prisma.trip.aggregate({
    _sum: {
      actualDistanceKm: true,
    },
    where: {
      status: "COMPLETED",
    },
  });

  const fuelLogs = await prisma.fuelLog.aggregate({
    _sum: {
      liters: true,
      fuelCost: true,
    },
  });

  const totalDistance = trips._sum.actualDistanceKm ? Number(trips._sum.actualDistanceKm) : 0;
  const totalLiters = fuelLogs._sum.liters ? Number(fuelLogs._sum.liters) : 0;
  const fuelEfficiency = totalLiters > 0 ? (totalDistance / totalLiters).toFixed(2) : "0.00";

  // 2. Fleet Utilization (ON_TRIP / Total Active Vehicles)
  const totalVehicles = await prisma.vehicle.count({
    where: {
      status: { not: "RETIRED" },
    },
  });

  const activeVehicles = await prisma.vehicle.count({
    where: {
      status: "ON_TRIP",
    },
  });

  const fleetUtilization = totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0;

  // 3. Operational Cost
  const maintenance = await prisma.maintenanceRecord.aggregate({
    _sum: { cost: true },
  });
  
  const expenses = await prisma.expense.aggregate({
    _sum: { tollCost: true, otherCost: true },
  });

  const maintenanceCost = maintenance._sum.cost ? Number(maintenance._sum.cost) : 0;
  const totalFuelCost = fuelLogs._sum.fuelCost ? Number(fuelLogs._sum.fuelCost) : 0;
  const tollCost = expenses._sum.tollCost ? Number(expenses._sum.tollCost) : 0;
  const otherCost = expenses._sum.otherCost ? Number(expenses._sum.otherCost) : 0;

  const operationalCost = maintenanceCost + totalFuelCost + tollCost + otherCost;

  // 4. Vehicle ROI
  const revenues = await prisma.tripRevenue.aggregate({
    _sum: { revenue: true },
  });
  
  const vehiclesAcquisition = await prisma.vehicle.aggregate({
    _sum: { acquisitionCost: true },
    where: { status: { not: "RETIRED" } }
  });

  const totalRevenue = revenues._sum.revenue ? Number(revenues._sum.revenue) : 0;
  const acquisitionCost = vehiclesAcquisition._sum.acquisitionCost ? Number(vehiclesAcquisition._sum.acquisitionCost) : 0;

  let vehicleROI = "0.0";
  if (acquisitionCost > 0) {
    const roi = ((totalRevenue - (maintenanceCost + totalFuelCost)) / acquisitionCost) * 100;
    vehicleROI = roi.toFixed(1);
  }

  // 5. Monthly Revenue
  // Fetching all revenues and grouping in JS for simplicity
  const allRevenues = await prisma.tripRevenue.findMany({
    select: {
      revenue: true,
      createdAt: true,
    }
  });

  const monthlyRevenueMap = {};
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  allRevenues.forEach(rev => {
    const d = new Date(rev.createdAt);
    const monthKey = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    if (!monthlyRevenueMap[monthKey]) {
      monthlyRevenueMap[monthKey] = 0;
    }
    monthlyRevenueMap[monthKey] += Number(rev.revenue);
  });

  const monthlyRevenue = Object.keys(monthlyRevenueMap).map(month => ({
    month,
    revenue: monthlyRevenueMap[month]
  }));

  // 6. Top Costliest Vehicles
  const allVehicles = await prisma.vehicle.findMany({
    include: {
      maintenanceRecords: { select: { cost: true } },
      fuelLogs: { select: { fuelCost: true } },
      expenses: { select: { tollCost: true, otherCost: true } }
    }
  });

  const vehicleCosts = allVehicles.map(v => {
    const mCost = v.maintenanceRecords.reduce((sum, r) => sum + Number(r.cost), 0);
    const fCost = v.fuelLogs.reduce((sum, l) => sum + Number(l.fuelCost), 0);
    const eCost = v.expenses.reduce((sum, e) => sum + Number(e.tollCost) + Number(e.otherCost), 0);
    const totalCost = mCost + fCost + eCost;

    return {
      vehicleId: v.id,
      regNo: v.regNo,
      modelName: v.modelName,
      totalCost
    };
  });

  const topCostliestVehicles = vehicleCosts
    .sort((a, b) => b.totalCost - a.totalCost)
    .slice(0, 5);

  return {
    summary: {
      fuelEfficiency: `${fuelEfficiency} km/l`,
      fleetUtilization: `${fleetUtilization}%`,
      operationalCost: operationalCost,
      vehicleROI: `${vehicleROI}%`
    },
    monthlyRevenue,
    topCostliestVehicles
  };
}

module.exports = {
  getAnalyticsReport,
};
