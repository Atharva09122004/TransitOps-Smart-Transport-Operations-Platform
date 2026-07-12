const express = require("express");
const tripController = require("../controllers/trip.controller");
const authenticate = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", authenticate, tripController.createTrip);
router.get("/", authenticate, tripController.getAllTrips);
router.get("/:id", authenticate, tripController.getTripById);
router.put("/:id", authenticate, tripController.updateTrip);
router.patch("/:id/dispatch", authenticate, tripController.dispatchTrip);
router.patch("/:id/complete", authenticate, tripController.completeTrip);
router.patch("/:id/cancel", authenticate, tripController.cancelTrip);

module.exports = router;