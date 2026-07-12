const { z } = require("zod");
const tripService = require("../services/trip.service");
const {
  tripIdParamSchema,
  createTripSchema,
  updateTripSchema,
  completeTripSchema,
  cancelTripSchema,
} = require("../validators/trip.validator");

function sendError(res, error) {
  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal server error",
  });
}

async function createTrip(req, res) {
  const parsedBody = createTripSchema.safeParse(req.body);

  if (!parsedBody.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid request body",
      errors: parsedBody.error.flatten(),
    });
  }

  try {
    const trip = await tripService.createTrip(parsedBody.data);
    return res.status(201).json({
      success: true,
      message: "Trip created successfully",
      data: trip,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

async function getAllTrips(req, res) {
  try {
    const trips = await tripService.getAllTrips();
    return res.status(200).json({
      success: true,
      data: trips,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

async function getTripById(req, res) {
  const parsedParams = tripIdParamSchema.safeParse(req.params);

  if (!parsedParams.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid trip ID",
      errors: parsedParams.error.flatten(),
    });
  }

  try {
    const trip = await tripService.getTripById(parsedParams.data.id);
    return res.status(200).json({
      success: true,
      data: trip,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

async function updateTrip(req, res) {
  const parsedParams = tripIdParamSchema.safeParse(req.params);
  const parsedBody = updateTripSchema.safeParse(req.body);

  if (!parsedParams.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid trip ID",
      errors: parsedParams.error.flatten(),
    });
  }

  if (!parsedBody.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid request body",
      errors: parsedBody.error.flatten(),
    });
  }

  try {
    const trip = await tripService.updateTrip(parsedParams.data.id, parsedBody.data);
    return res.status(200).json({
      success: true,
      message: "Trip updated successfully",
      data: trip,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

async function dispatchTrip(req, res) {
  const parsedParams = tripIdParamSchema.safeParse(req.params);

  if (!parsedParams.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid trip ID",
      errors: parsedParams.error.flatten(),
    });
  }

  try {
    const trip = await tripService.dispatchTrip(parsedParams.data.id);
    return res.status(200).json({
      success: true,
      message: "Trip dispatched successfully",
      data: trip,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

async function completeTrip(req, res) {
  const parsedParams = tripIdParamSchema.safeParse(req.params);
  const parsedBody = completeTripSchema.safeParse(req.body);

  if (!parsedParams.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid trip ID",
      errors: parsedParams.error.flatten(),
    });
  }

  if (!parsedBody.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid request body",
      errors: parsedBody.error.flatten(),
    });
  }

  try {
    const trip = await tripService.completeTrip(parsedParams.data.id, parsedBody.data.actualDistanceKm);
    return res.status(200).json({
      success: true,
      message: "Trip completed successfully",
      data: trip,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

async function cancelTrip(req, res) {
  const parsedParams = tripIdParamSchema.safeParse(req.params);
  const parsedBody = cancelTripSchema.safeParse(req.body);

  if (!parsedParams.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid trip ID",
      errors: parsedParams.error.flatten(),
    });
  }

  if (!parsedBody.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid request body",
      errors: parsedBody.error.flatten(),
    });
  }

  try {
    const trip = await tripService.cancelTrip(parsedParams.data.id, parsedBody.data.cancelledReason);
    return res.status(200).json({
      success: true,
      message: "Trip cancelled successfully",
      data: trip,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

module.exports = {
  createTrip,
  getAllTrips,
  getTripById,
  updateTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
};