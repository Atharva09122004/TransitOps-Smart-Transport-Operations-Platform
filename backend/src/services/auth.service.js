const prisma = require("../config/prisma");
const { comparePassword } = require("../utils/hash");
const { generateToken } = require("../utils/jwt");

const LOCK_DURATION_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function login(email, password) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw createHttpError(404, "User not found");
  }

  if (!user.isActive) {
    throw createHttpError(403, "Account is inactive");
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw createHttpError(423, "Account is locked. Please try again later.");
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);

  if (!isPasswordValid) {
    const failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    const updateData = {
      failedLoginAttempts,
    };

    if (failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      updateData.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    throw createHttpError(401, "Invalid password");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      displayName: user.displayName,
      email: user.email,
      role: user.role,
    },
  };
}

module.exports = {
  login,
};