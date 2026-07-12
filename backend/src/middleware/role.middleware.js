function roleMiddleware(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!allowedRoles.length || allowedRoles.includes(userRole)) {
      return next();
    }

    return res.status(403).json({ message: "You do not have permission to access this resource." });
  };
}

module.exports = roleMiddleware;