import * as tripService from "../services/tripService.js";

export const getTrips = async (req, res, next) => {
  try {
    const { search, slNo, vehicleNumber, date, transport, fromLocation, toLocation, limit } = req.query;

    let trips = await tripService.getAllTrips();

    if (search) {
      const q = String(search).toLowerCase().trim();
      trips = trips.filter(
        (t) =>
          String(t.slNo).includes(q) ||
          t.vehicleNumber.toLowerCase().includes(q) ||
          t.date.includes(q) ||
          t.transport.toLowerCase().includes(q) ||
          t.fromLocation.toLowerCase().includes(q) ||
          t.toLocation.toLowerCase().includes(q)
      );
    }

    if (slNo) trips = trips.filter((t) => String(t.slNo) === String(slNo));
    if (vehicleNumber) trips = trips.filter((t) => t.vehicleNumber.toLowerCase().includes(String(vehicleNumber).toLowerCase()));
    if (date) trips = trips.filter((t) => t.date === String(date));
    if (transport) trips = trips.filter((t) => t.transport.toLowerCase().includes(String(transport).toLowerCase()));
    if (fromLocation) trips = trips.filter((t) => t.fromLocation.toLowerCase().includes(String(fromLocation).toLowerCase()));
    if (toLocation) trips = trips.filter((t) => t.toLocation.toLowerCase().includes(String(toLocation).toLowerCase()));

    if (limit) {
      const l = parseInt(String(limit), 10);
      if (!isNaN(l)) {
        trips = trips.slice(0, l);
      }
    }

    res.json(trips);
  } catch (error) {
    next(error);
  }
};

export const getPendingCommissionTrips = async (req, res, next) => {
  try {
    const trips = (await tripService.getAllTrips()).filter(tripService.isPendingCommission);
    res.json(trips);
  } catch (error) {
    next(error);
  }
};

export const getPendingAdvanceVehicleTrips = async (req, res, next) => {
  try {
    const trips = (await tripService.getAllTrips()).filter(tripService.isPendingAdvanceVehicle);
    res.json(trips);
  } catch (error) {
    next(error);
  }
};

export const getPendingAdvanceCompanyTrips = async (req, res, next) => {
  try {
    const trips = (await tripService.getAllTrips()).filter(tripService.isPendingAdvanceCompany);
    res.json(trips);
  } catch (error) {
    next(error);
  }
};

export const getBalanceVehicleTrips = async (req, res, next) => {
  try {
    const trips = (await tripService.getAllTrips()).filter(tripService.isBalanceVehicleActive);
    res.json(trips);
  } catch (error) {
    next(error);
  }
};

export const getBalanceCompanyTrips = async (req, res, next) => {
  try {
    const trips = (await tripService.getAllTrips()).filter(tripService.isBalanceCompanyActive);
    res.json(trips);
  } catch (error) {
    next(error);
  }
};

export const getCompletedTrips = async (req, res, next) => {
  try {
    const trips = (await tripService.getAllTrips()).filter(tripService.isCompletedTrip);
    res.json(trips);
  } catch (error) {
    next(error);
  }
};

export const createTrip = async (req, res, next) => {
  try {
    const body = req.body;
    if (!body.date || !body.vehicleNumber || !body.fromLocation || !body.toLocation || !body.transport) {
      res.status(400);
      throw new Error("Date, Vehicle Number, From, To, and Transport are required.");
    }
    const createdTrip = await tripService.createTrip(body, req.user);
    res.status(201).json(createdTrip);
  } catch (error) {
    next(error);
  }
};

export const updateTrip = async (req, res, next) => {
  try {
    const updatedTrip = await tripService.updateTrip(req.params.id, req.body, req.user);
    res.json(updatedTrip);
  } catch (error) {
    if (error.message === "Trip not found") res.status(404);
    if (error.message === "Workers cannot edit completed trips") res.status(403);
    next(error);
  }
};

export const clearVehicleBalance = async (req, res, next) => {
  try {
    const updatedTrip = await tripService.clearVehicleBalance(req.params.id, req.user);
    res.json(updatedTrip);
  } catch (error) {
    if (error.message === "Trip not found") res.status(404);
    next(error);
  }
};

export const clearCompanyBalance = async (req, res, next) => {
  try {
    const updatedTrip = await tripService.clearCompanyBalance(req.params.id, req.user);
    res.json(updatedTrip);
  } catch (error) {
    if (error.message === "Trip not found") res.status(404);
    next(error);
  }
};

export const deleteTrip = async (req, res, next) => {
  try {
    await tripService.deleteTrip(req.params.id, req.user);
    res.json({ success: true, message: "Trip deleted successfully" });
  } catch (error) {
    if (error.message === "Trip not found") res.status(404);
    next(error);
  }
};
