const express = require("express");
const tripController = require("../controllers/trip.controller");
const authenticate = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");

const router = express.Router();

router.get("/", authenticate, requireRole("DISPATCHER"), tripController.getAllTrips);
router.get("/:id", authenticate, requireRole("DISPATCHER"), tripController.getTripById);
router.post("/", authenticate, requireRole("DISPATCHER"), tripController.createTrip);
router.put("/:id", authenticate, requireRole("DISPATCHER"), tripController.updateTrip);
router.patch("/:id/dispatch", authenticate, requireRole("DISPATCHER"), tripController.dispatchTrip);
router.patch("/:id/complete", authenticate, requireRole("DISPATCHER"), tripController.completeTrip);
router.patch("/:id/cancel", authenticate, requireRole("DISPATCHER"), tripController.cancelTrip);

module.exports = router;
