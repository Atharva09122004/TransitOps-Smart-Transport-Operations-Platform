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

module.exports = {
  createDriver,
};