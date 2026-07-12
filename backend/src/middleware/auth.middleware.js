function authMiddleware(req, res, next) {
  const authorizationHeader = req.headers.authorization || "";

  if (!authorizationHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization token is required." });
  }

  req.user = req.user || null;
  next();
}

module.exports = authMiddleware;