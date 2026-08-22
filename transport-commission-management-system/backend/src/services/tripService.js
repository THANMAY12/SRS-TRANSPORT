import { Trip } from "../models/Trip.js";
import { addAuditLog } from "./auditLogService.js";

export function isPendingCommission(t) {
  return t.commission === null || t.commission === undefined;
}

export function isPendingAdvanceVehicle(t) {
  return !t.advancePaidType || t.advancePaidType.trim() === "";
}

export function isPendingAdvanceCompany(t) {
  return !t.advanceReceivedType || t.advanceReceivedType.trim() === "";
}

export function getVehicleBalanceAmount(t) {
  if (!t) return 0;
  const freight = Number(t.freight) || 0;
  const advPaid = Number(t.advancePaidAmount) || 0;
  return Math.max(0, freight - advPaid);
}

export function isBalanceVehicleActive(t) {
  if (!t || isPendingAdvanceVehicle(t)) return false;
  if (t.advancePaidType === "To Pay") return false;
  const balance = getVehicleBalanceAmount(t);
  return balance > 200 && !t.vehicleBalanceCleared;
}

export function getCompanyBalanceAmount(t) {
  if (!t) return 0;
  const booking = Number(t.booking) || 0;
  const advRec = Number(t.advanceReceivedAmount) || 0;
  return Math.max(0, booking - advRec);
}

export function isBalanceCompanyActive(t) {
  if (!t || isPendingAdvanceCompany(t)) return false;
  if (t.advanceReceivedType === "To Pay") return false;
  const balance = getCompanyBalanceAmount(t);
  return balance > 200 && !t.companyBalanceCleared;
}

export function isCompletedTrip(t) {
  const commDone = !isPendingCommission(t);
  const advPaidDone = !isPendingAdvanceVehicle(t);
  const advRecDone = !isPendingAdvanceCompany(t);
  const vehBalDone = !isBalanceVehicleActive(t);
  const compBalDone = !isBalanceCompanyActive(t);

  return commDone && advPaidDone && advRecDone && vehBalDone && compBalDone;
}

export function mapTripDoc(doc) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: obj.id,
    slNo: obj.sl_no,
    date: obj.date,
    vehicleNumber: obj.vehicle_number,
    driverPhone: obj.driver_phone || "",
    fromLocation: obj.from_location,
    toLocation: obj.to_location,
    freight: obj.freight,
    transport: obj.transport,
    booking: obj.booking,
    commission: obj.commission,
    advanceReceivedAmount: obj.advance_received_amount,
    advanceReceivedType: obj.advance_received_type,
    advancePaidAmount: obj.advance_paid_amount,
    advancePaidType: obj.advance_paid_type,
    remarks: obj.remarks,
    commissionDueDate: obj.commission_due_date,
    advanceDueDate: obj.advance_due_date,
    collectionDueDate: obj.collection_due_date,
    vehicleBalanceCleared: obj.vehicle_balance_cleared,
    companyBalanceCleared: obj.company_balance_cleared,
    vehicleBalanceClearedDate: obj.vehicle_balance_cleared_date,
    companyBalanceClearedDate: obj.company_balance_cleared_date,
    createdAt: obj.created_at,
    updatedAt: obj.updated_at,
    createdBy: obj.created_by,
    updatedBy: obj.updated_by,
  };
}

export async function getAllTrips() {
  const trips = await Trip.find().sort({ sl_no: -1 }).lean();
  return trips.map(mapTripDoc);
}

export async function getTripById(id) {
  const trip = await Trip.findOne({ id }).lean();
  return mapTripDoc(trip);
}

export async function getNextSlNo() {
  const latestTrip = await Trip.findOne().sort({ sl_no: -1 }).lean();
  return latestTrip ? latestTrip.sl_no + 1 : 1;
}

export async function createTrip(body, user) {
  const nextSlNo = await getNextSlNo();
  const tripId = "trip_" + Date.now();
  const now = new Date().toISOString();
  const dateStr = body.date;

  const driverPhone = body.driverPhone ? body.driverPhone.trim() : "";
  const freight = Number(body.freight) || 0;
  const booking = Number(body.booking) || 0;
  const commission =
    body.commission !== null && body.commission !== undefined && body.commission !== ""
      ? Number(body.commission)
      : null;
  const advanceReceivedAmount = Number(body.advanceReceivedAmount) || 0;
  const advanceReceivedType = body.advanceReceivedType || "";
  const advancePaidAmount = Number(body.advancePaidAmount) || 0;
  const advancePaidType = body.advancePaidType || "";
  const remarks = body.remarks || "";

  await Trip.create({
    id: tripId,
    sl_no: nextSlNo,
    date: dateStr,
    vehicle_number: body.vehicleNumber.trim().toUpperCase(),
    driver_phone: driverPhone,
    from_location: body.fromLocation.trim(),
    to_location: body.toLocation.trim(),
    freight,
    transport: body.transport.trim(),
    booking,
    commission,
    advance_received_amount: advanceReceivedAmount,
    advance_received_type: advanceReceivedType,
    advance_paid_amount: advancePaidAmount,
    advance_paid_type: advancePaidType,
    remarks,
    commission_due_date: dateStr,
    advance_due_date: dateStr,
    collection_due_date: dateStr,
    vehicle_balance_cleared: false,
    company_balance_cleared: false,
    created_at: now,
    updated_at: now,
    created_by: user.username,
    updated_by: user.username,
  });

  const createdTrip = await getTripById(tripId);

  await addAuditLog(
    user.username,
    user.role,
    "CREATE_TRIP",
    tripId,
    "",
    `Created Trip Sl.No ${nextSlNo} (${body.vehicleNumber.toUpperCase()})`
  );

  return createdTrip;
}

export async function updateTrip(id, body, user) {
  const existingTrip = await getTripById(id);
  if (!existingTrip) {
    throw new Error("Trip not found");
  }

  if (user.role === "WORKER" && isCompletedTrip(existingTrip)) {
    throw new Error("Workers cannot edit completed trips");
  }

  const oldValStr = JSON.stringify(existingTrip);

  const updatedDate = body.date || existingTrip.date;
  const updatedVehicleNumber = (body.vehicleNumber || existingTrip.vehicleNumber).toUpperCase();
  const updatedDriverPhone =
    body.driverPhone !== undefined ? body.driverPhone.trim() : existingTrip.driverPhone || "";
  const updatedFrom =
    body.fromLocation !== undefined ? body.fromLocation : existingTrip.fromLocation;
  const updatedTo = body.toLocation !== undefined ? body.toLocation : existingTrip.toLocation;
  const updatedFreight = body.freight !== undefined ? Number(body.freight) : existingTrip.freight;
  const updatedTransport = body.transport !== undefined ? body.transport : existingTrip.transport;
  const updatedBooking = body.booking !== undefined ? Number(body.booking) : existingTrip.booking;

  const updatedCommission =
    body.commission !== undefined
      ? body.commission === null || body.commission === ""
        ? null
        : Number(body.commission)
      : existingTrip.commission;

  const updatedAdvRecAmt =
    body.advanceReceivedAmount !== undefined
      ? Number(body.advanceReceivedAmount)
      : existingTrip.advanceReceivedAmount;
  const updatedAdvRecType =
    body.advanceReceivedType !== undefined
      ? body.advanceReceivedType
      : existingTrip.advanceReceivedType;
  const updatedAdvPaidAmt =
    body.advancePaidAmount !== undefined
      ? Number(body.advancePaidAmount)
      : existingTrip.advancePaidAmount;
  const updatedAdvPaidType =
    body.advancePaidType !== undefined ? body.advancePaidType : existingTrip.advancePaidType;
  const updatedRemarks = body.remarks !== undefined ? body.remarks : existingTrip.remarks;

  const updatedCommissionDueDate =
    body.commissionDueDate !== undefined
      ? body.commissionDueDate
      : existingTrip.commissionDueDate || existingTrip.date;
  const updatedAdvanceDueDate =
    body.advanceDueDate !== undefined
      ? body.advanceDueDate
      : existingTrip.advanceDueDate || existingTrip.date;
  const updatedCollectionDueDate =
    body.collectionDueDate !== undefined
      ? body.collectionDueDate
      : existingTrip.collectionDueDate || existingTrip.date;

  const now = new Date().toISOString();

  await Trip.updateOne(
    { id },
    {
      date: updatedDate,
      vehicle_number: updatedVehicleNumber,
      driver_phone: updatedDriverPhone,
      from_location: updatedFrom,
      to_location: updatedTo,
      freight: updatedFreight,
      transport: updatedTransport,
      booking: updatedBooking,
      commission: updatedCommission,
      advance_received_amount: updatedAdvRecAmt,
      advance_received_type: updatedAdvRecType,
      advance_paid_amount: updatedAdvPaidAmt,
      advance_paid_type: updatedAdvPaidType,
      remarks: updatedRemarks,
      commission_due_date: updatedCommissionDueDate,
      advance_due_date: updatedAdvanceDueDate,
      collection_due_date: updatedCollectionDueDate,
      updated_at: now,
      updated_by: user.username,
    }
  );

  const updatedTrip = await getTripById(id);

  await addAuditLog(
    user.username,
    user.role,
    "UPDATE_TRIP",
    id,
    oldValStr,
    JSON.stringify(updatedTrip)
  );

  return updatedTrip;
}

export async function clearVehicleBalance(id, amountToClear, user, clearedDate) {
  const existingTrip = await getTripById(id);
  if (!existingTrip) {
    throw new Error("Trip not found");
  }

  const currentBalance = getVehicleBalanceAmount(existingTrip);

  const clearAmt =
    amountToClear !== undefined && amountToClear !== null ? Number(amountToClear) : currentBalance;

  if (typeof clearAmt !== "number" || isNaN(clearAmt)) {
    throw new Error("Invalid amount: Amount must be a valid number.");
  }
  if (clearAmt <= 0) {
    throw new Error("Invalid amount: Amount to clear must be greater than 0.");
  }
  if (clearAmt > currentBalance) {
    throw new Error(
      `Invalid amount: Amount to clear (₹${clearAmt}) exceeds current vehicle balance (₹${currentBalance}).`
    );
  }

  const remainingBalance = Math.max(0, currentBalance - clearAmt);
  const isSettled = remainingBalance <= 200;
  const nowStr = new Date().toISOString();
  if (!clearedDate || !String(clearedDate).trim()) {
    throw new Error("Invalid clearance date: Clearance date is required.");
  }
  const selectedClearedDate = String(clearedDate).trim();

  // Atomic update to ensure no negative balance / race conditions
  const updatedDoc = await Trip.findOneAndUpdate(
    {
      id,
      $expr: {
        $gte: [{ $subtract: ["$freight", "$advance_paid_amount"] }, clearAmt],
      },
    },
    {
      $inc: { advance_paid_amount: clearAmt },
      $set: {
        vehicle_balance_cleared: isSettled,
        vehicle_balance_cleared_date: selectedClearedDate,
        updated_at: nowStr,
        updated_by: user.username,
      },
    },
    { new: true }
  );

  if (!updatedDoc) {
    const recheckedTrip = await getTripById(id);
    if (!recheckedTrip) {
      throw new Error("Trip not found");
    }
    const freshBal = getVehicleBalanceAmount(recheckedTrip);
    throw new Error(
      `Clearance conflict: Current balance has changed (₹${freshBal}). Cannot clear ₹${clearAmt}.`
    );
  }

  const updatedTrip = mapTripDoc(updatedDoc);

  await addAuditLog(
    user.username,
    user.role,
    isSettled && clearAmt === currentBalance
      ? "CLEAR_VEHICLE_BALANCE"
      : "PARTIAL_BALANCE_CLEARANCE",
    id,
    `Vehicle Balance: Previous Balance ₹${currentBalance}`,
    `Amount Cleared: ₹${clearAmt} | Remaining Balance: ₹${remainingBalance}${isSettled ? " (Settled <= ₹200)" : ""} | Cleared Date: ${selectedClearedDate}`
  );

  return {
    success: true,
    amountCleared: clearAmt,
    previousBalance: currentBalance,
    remainingBalance,
    settled: isSettled,
    trip: updatedTrip,
  };
}

export async function clearCompanyBalance(id, amountToClear, user, clearedDate) {
  const existingTrip = await getTripById(id);
  if (!existingTrip) {
    throw new Error("Trip not found");
  }

  const currentBalance = getCompanyBalanceAmount(existingTrip);

  const clearAmt =
    amountToClear !== undefined && amountToClear !== null ? Number(amountToClear) : currentBalance;

  if (typeof clearAmt !== "number" || isNaN(clearAmt)) {
    throw new Error("Invalid amount: Amount must be a valid number.");
  }
  if (clearAmt <= 0) {
    throw new Error("Invalid amount: Amount to clear must be greater than 0.");
  }
  if (clearAmt > currentBalance) {
    throw new Error(
      `Invalid amount: Amount to clear (₹${clearAmt}) exceeds current company collection balance (₹${currentBalance}).`
    );
  }

  const remainingBalance = Math.max(0, currentBalance - clearAmt);
  const isSettled = remainingBalance <= 200;
  const nowStr = new Date().toISOString();
  if (!clearedDate || !String(clearedDate).trim()) {
    throw new Error("Invalid clearance date: Clearance date is required.");
  }
  const selectedClearedDate = String(clearedDate).trim();

  // Atomic update to ensure no negative balance / race conditions
  const updatedDoc = await Trip.findOneAndUpdate(
    {
      id,
      $expr: {
        $gte: [{ $subtract: ["$booking", "$advance_received_amount"] }, clearAmt],
      },
    },
    {
      $inc: { advance_received_amount: clearAmt },
      $set: {
        company_balance_cleared: isSettled,
        company_balance_cleared_date: selectedClearedDate,
        updated_at: nowStr,
        updated_by: user.username,
      },
    },
    { new: true }
  );

  if (!updatedDoc) {
    const recheckedTrip = await getTripById(id);
    if (!recheckedTrip) {
      throw new Error("Trip not found");
    }
    const freshBal = getCompanyBalanceAmount(recheckedTrip);
    throw new Error(
      `Clearance conflict: Current balance has changed (₹${freshBal}). Cannot clear ₹${clearAmt}.`
    );
  }

  const updatedTrip = mapTripDoc(updatedDoc);

  await addAuditLog(
    user.username,
    user.role,
    isSettled && clearAmt === currentBalance
      ? "CLEAR_COMPANY_BALANCE"
      : "PARTIAL_BALANCE_CLEARANCE",
    id,
    `Company Balance: Previous Balance ₹${currentBalance}`,
    `Amount Cleared: ₹${clearAmt} | Remaining Balance: ₹${remainingBalance}${isSettled ? " (Settled <= ₹200)" : ""} | Cleared Date: ${selectedClearedDate}`
  );

  return {
    success: true,
    amountCleared: clearAmt,
    previousBalance: currentBalance,
    remainingBalance,
    settled: isSettled,
    trip: updatedTrip,
  };
}

export async function deleteTrip(id, user) {
  const trip = await getTripById(id);
  if (!trip) {
    throw new Error("Trip not found");
  }

  await Trip.deleteOne({ id });

  await addAuditLog(
    user.username,
    user.role,
    "DELETE_TRIP",
    id,
    JSON.stringify(trip),
    "TRIP_DELETED"
  );
}
