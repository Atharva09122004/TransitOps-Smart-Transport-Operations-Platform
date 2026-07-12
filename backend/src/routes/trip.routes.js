const express = require("express");
const tripController = require("../controllers/trip.controller");
const authenticate = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");

const router = express.Router();

router.get("/", authenticate, requireRole("FLEET_MANAGER", "DRIVER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"), tripController.getAllTrips);
router.get("/:id", authenticate, requireRole("FLEET_MANAGER", "DRIVER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"), tripController.getTripById);
router.post("/", authenticate, requireRole("FLEET_MANAGER"), tripController.createTrip);
router.put("/:id", authenticate, requireRole("FLEET_MANAGER"), tripController.updateTrip);
router.patch("/:id/dispatch", authenticate, requireRole("FLEET_MANAGER"), tripController.dispatchTrip);
router.patch("/:id/complete", authenticate, requireRole("FLEET_MANAGER"), tripController.completeTrip);
router.patch("/:id/cancel", authenticate, requireRole("FLEET_MANAGER"), tripController.cancelTrip);

module.exports = router;