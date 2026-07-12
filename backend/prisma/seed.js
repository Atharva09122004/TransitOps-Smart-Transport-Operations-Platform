const prisma = require("../src/config/prisma");
const { hashPassword } = require("../src/utils/hash");

async function main() {
  const users = [
    {
      email: "manager@transitops.com",
      password: "password123",
      displayName: "Fleet Manager",
      role: "FLEET_MANAGER",
    },
    {
      email: "driver@transitops.com",
      password: "password123",
      displayName: "Driver User",
      role: "DRIVER",
    },
    {
      email: "safety@transitops.com",
      password: "password123",
      displayName: "Safety Officer",
      role: "SAFETY_OFFICER",
    },
    {
      email: "finance@transitops.com",
      password: "password123",
      displayName: "Finance Analyst",
      role: "FINANCIAL_ANALYST",
    },
  ];

  for (const user of users) {
    const passwordHash = await hashPassword(user.password);

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        passwordHash,
        displayName: user.displayName,
        role: user.role,
        isActive: true,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
      create: {
        email: user.email,
        passwordHash,
        displayName: user.displayName,
        role: user.role,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed completed successfully.");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });