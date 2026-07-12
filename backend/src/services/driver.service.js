const prisma = require("../config/prisma");

const ALLOWED_CATEGORIES = ["LMV", "HMV"];

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeContact(contact) {
  if (contact === undefined || contact === null || contact === "") {
    return null;
  }

  return contact;
}

async function createDriver(payload) {
  const { name, userId, licenseNo, category, licenseExpiry, contact } = payload;

  if (!ALLOWED_CATEGORIES.includes(category)) {
    throw createHttpError(400, "Invalid driver category");
  }

  const parsedLicenseExpiry = new Date(licenseExpiry);

  if (Number.isNaN(parsedLicenseExpiry.getTime())) {
    throw createHttpError(400, "Invalid license expiry date");
  }

  if (contact !== undefined && contact !== null && contact !== "" && !/^\d{10}$/.test(contact)) {
    throw createHttpError(400, "Invalid contact number");
  }

  const existingDriver = await prisma.driver.findUnique({
    where: { licenseNo },
  });

  if (existingDriver) {
    throw createHttpError(409, "License number already exists");
  }

  if (userId !== undefined && userId !== null) {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!existingUser) {
      throw createHttpError(404, "User not found");
    }
  }

  const driver = await prisma.driver.create({
    data: {
      name,
      userId: userId ?? null,
      licenseNo,
      category,
      licenseExpiry: parsedLicenseExpiry,
      contact: normalizeContact(contact),
    },
  });

  return {
    id: driver.id,
    name: driver.name,
    licenseNo: driver.licenseNo,
    category: driver.category,
    licenseExpiry: driver.licenseExpiry,
    contact: driver.contact,
    safetyScore: driver.safetyScore,
    status: driver.status,
  };
}

async function getDrivers() {
  const drivers = await prisma.driver.findMany({
    orderBy: { createdAt: "desc" },
  });
  return drivers.map((driver) => ({
    id: driver.id,
    userId: driver.userId,
    name: driver.name,
    licenseNo: driver.licenseNo,
    category: driver.category,
    licenseExpiry: driver.licenseExpiry,
    contact: driver.contact,
    safetyScore: driver.safetyScore,
    status: driver.status,
    isActive: driver.isActive,
    createdAt: driver.createdAt,
    updatedAt: driver.updatedAt,
  }));
}

async function updateDriver(id, payload) {
  const { name, userId, licenseNo, category, licenseExpiry, contact, status, isActive } = payload;

  const existingDriver = await prisma.driver.findUnique({
    where: { id },
  });
  if (!existingDriver) {
    throw createHttpError(404, "Driver not found");
  }

  if (category !== undefined && !ALLOWED_CATEGORIES.includes(category)) {
    throw createHttpError(400, "Invalid driver category");
  }

  let parsedLicenseExpiry;
  if (licenseExpiry !== undefined) {
    parsedLicenseExpiry = new Date(licenseExpiry);
    if (Number.isNaN(parsedLicenseExpiry.getTime())) {
      throw createHttpError(400, "Invalid license expiry date");
    }
  }

  if (contact !== undefined && contact !== null && contact !== "" && !/^\d{10}$/.test(contact)) {
    throw createHttpError(400, "Invalid contact number");
  }

  if (licenseNo !== undefined && licenseNo !== existingDriver.licenseNo) {
    const licenseConflict = await prisma.driver.findUnique({
      where: { licenseNo },
    });
    if (licenseConflict) {
      throw createHttpError(409, "License number already exists");
    }
  }

  if (userId !== undefined && userId !== null && userId !== existingDriver.userId) {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!existingUser) {
      throw createHttpError(404, "User not found");
    }
  }

  const updated = await prisma.driver.update({
    where: { id },
    data: {
      name,
      userId: userId !== undefined ? userId : undefined,
      licenseNo,
      category,
      licenseExpiry: parsedLicenseExpiry,
      contact: contact !== undefined ? normalizeContact(contact) : undefined,
      status,
      isActive,
    },
  });

  return {
    id: updated.id,
    userId: updated.userId,
    name: updated.name,
    licenseNo: updated.licenseNo,
    category: updated.category,
    licenseExpiry: updated.licenseExpiry,
    contact: updated.contact,
    safetyScore: updated.safetyScore,
    status: updated.status,
    isActive: updated.isActive,
  };
}

async function deleteDriver(id) {
  const existingDriver = await prisma.driver.findUnique({
    where: { id },
  });
  if (!existingDriver) {
    throw createHttpError(404, "Driver not found");
  }

  try {
    await prisma.driver.delete({
      where: { id },
    });
  } catch (error) {
    if (error.code === "P2003") {
      throw createHttpError(409, "Cannot delete driver because they are associated with trips");
    }
    throw error;
  }
}

module.exports = {
  createDriver,
  getDrivers,
  updateDriver,
  deleteDriver,
};