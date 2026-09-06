import * as tripService from "../services/tripService.js";

export const getTrips = async (req, res, next) => {
  try {
    const { search, slNo, vehicleNumber, date, transport, fromLocation, toLocation, limit } =
      req.query;

    let trips = await tripService.getAllTrips();

    if (search) {
      const q = String(search).toLowerCase().trim();
      trips = trips.filter(
        (t) =>
          String(t.slNo).includes(q) ||
          t.vehicleNumber.toLowerCase().includes(q) ||
          (t.driverPhone && t.driverPhone.toLowerCase().includes(q)) ||
          t.date.includes(q) ||
          t.transport.toLowerCase().includes(q) ||
          t.fromLocation.toLowerCase().includes(q) ||
          t.toLocation.toLowerCase().includes(q)
      );
    }

    if (slNo) trips = trips.filter((t) => String(t.slNo) === String(slNo));
    if (vehicleNumber)
      trips = trips.filter((t) =>
        t.vehicleNumber.toLowerCase().includes(String(vehicleNumber).toLowerCase())
      );
    if (date) trips = trips.filter((t) => t.date === String(date));
    if (transport)
      trips = trips.filter((t) =>
        t.transport.toLowerCase().includes(String(transport).toLowerCase())
      );
    if (fromLocation)
      trips = trips.filter((t) =>
        t.fromLocation.toLowerCase().includes(String(fromLocation).toLowerCase())
      );
    if (toLocation)
      trips = trips.filter((t) =>
        t.toLocation.toLowerCase().includes(String(toLocation).toLowerCase())
      );

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
    if (
      !body.date ||
      !body.vehicleNumber ||
      !body.fromLocation ||
      !body.toLocation ||
      !body.transport
    ) {
      res.status(400);
      throw new Error("Date, Vehicle Number, From, To, and Transport are required.");
    }
    const createdTrip = await tripService.createTrip(body, req.user);
    res.status(201).json(createdTrip);
  } catch (error) {
    if (error.message && error.message.includes("already exists")) {
      res.status(409);
    } else if (
      error.message &&
      (error.message.startsWith("Commission Received Type") ||
        error.message.startsWith("Sl.No is required"))
    ) {
      res.status(400);
    }
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
    if (error.message && error.message.includes("already exists")) {
      res.status(409);
    } else if (
      error.message &&
      (error.message.startsWith("Commission Received Type") ||
        error.message.startsWith("Sl.No is required"))
    ) {
      res.status(400);
    }
    next(error);
  }
};

export const clearVehicleBalance = async (req, res, next) => {
  try {
    const amountToClear =
      req.body?.amountToClear !== undefined ? req.body.amountToClear : undefined;
    const clearedDate = req.body?.clearedDate || req.body?.cleared_date;
    const remarks = req.body?.remarks;
    const result = await tripService.clearVehicleBalance(
      req.params.id,
      amountToClear,
      req.user,
      clearedDate,
      remarks
    );
    res.json(result);
  } catch (error) {
    if (error.message === "Trip not found") res.status(404);
    if (
      error.message.startsWith("Invalid amount") ||
      error.message.startsWith("Clearance conflict")
    ) {
      res.status(400);
    }
    next(error);
  }
};

export const clearCompanyBalance = async (req, res, next) => {
  try {
    const amountToClear =
      req.body?.amountToClear !== undefined ? req.body.amountToClear : undefined;
    const clearedDate = req.body?.clearedDate || req.body?.cleared_date;
    const remarks = req.body?.remarks;
    const result = await tripService.clearCompanyBalance(
      req.params.id,
      amountToClear,
      req.user,
      clearedDate,
      remarks
    );
    res.json(result);
  } catch (error) {
    if (error.message === "Trip not found") res.status(404);
    if (
      error.message.startsWith("Invalid amount") ||
      error.message.startsWith("Clearance conflict")
    ) {
      res.status(400);
    }
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

export const getPendingApprovalTrips = async (req, res, next) => {
  try {
    const trips = await tripService.getPendingApprovalTrips();
    res.json(trips);
  } catch (error) {
    next(error);
  }
};

export const approveTrip = async (req, res, next) => {
  try {
    const updatedTrip = await tripService.approveTrip(req.params.id, req.user);
    res.json(updatedTrip);
  } catch (error) {
    if (error.message === "Trip not found") res.status(404);
    next(error);
  }
};

export const rejectTrip = async (req, res, next) => {
  try {
    const reason = req.body?.reason || req.body?.rejectionReason || "";
    if (typeof reason !== "string" || !reason.trim()) {
      res.status(400);
      throw new Error("Rejection reason is required.");
    }
    const updatedTrip = await tripService.rejectTrip(req.params.id, reason, req.user);
    res.json(updatedTrip);
  } catch (error) {
    if (error.message === "Trip not found") res.status(404);
    else if (error.message === "Rejection reason is required.") res.status(400);
    next(error);
  }
};

export const getPendingRefundTrips = async (req, res, next) => {
  try {
    const trips = await tripService.getPendingRefundTrips();
    res.json(trips);
  } catch (error) {
    next(error);
  }
};

export const setTripRefund = async (req, res, next) => {
  try {
    const refund = req.body?.refund !== undefined ? req.body.refund : null;
    const updatedTrip = await tripService.setTripRefund(req.params.id, refund, req.user);
    res.json(updatedTrip);
  } catch (error) {
    if (error.message === "Trip not found") res.status(404);
    else if (error.message.startsWith("Refund amount must be")) res.status(400);
    next(error);
  }
};
