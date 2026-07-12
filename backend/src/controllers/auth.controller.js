const { z } = require("zod");
const authService = require("../services/auth.service");

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

async function login(req, res) {
  const parsedBody = loginSchema.safeParse(req.body);

  if (!parsedBody.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid request body",
      errors: parsedBody.error.flatten(),
    });
  }

  try {
    const result = await authService.login(parsedBody.data.email, parsedBody.data.password);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}

module.exports = {
  login,
};