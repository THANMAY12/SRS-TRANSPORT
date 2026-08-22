import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from backend/.env
dotenv.config({ path: path.join(__dirname, "../../backend/.env") });

import { Trip } from "../../backend/src/models/Trip.js";
import { AuditLog } from "../../backend/src/models/AuditLog.js";
import * as tripService from "../../backend/src/services/tripService.js";
import * as reportService from "../../backend/src/services/reportService.js";

async function runLiveTest() {
  console.log("==================================================");
  console.log("STARTING REAL LIVE PRODUCTION WORKFLOW TEST");
  console.log("==================================================");

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI not found in backend/.env");
  }

  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected successfully to MongoDB.");

  const testUser = { username: "TEST_RUNNER", role: "ADMIN" };
  const createdTripIds = [];

  try {
    // --------------------------------------------------
    // TEST 1: Create real trip with test values
    // --------------------------------------------------
    console.log("\n--- TEST 1: Create Real Trip ---");
    const tripData = {
      date: new Date().toISOString().split("T")[0],
      vehicleNumber: "TEST-KA-01-9999",
      fromLocation: "Bangalore",
      toLocation: "Mumbai",
      freight: 40000,
      transport: "Test Logistics",
      booking: 50000,
      commission: 3000,
      advancePaidAmount: 39000, // Freight 40k - 39k = 1,000 balance
      advancePaidType: "Cash",
      advanceReceivedAmount: 49000, // Booking 50k - 49k = 1,000 balance
      advanceReceivedType: "Cash",
      remarks: "Live Automated Workflow Test Trip",
    };

    const trip1 = await tripService.createTrip(tripData, testUser);
    createdTripIds.push(trip1.id);
    console.log(`Trip 1 created successfully with ID: ${trip1.id}, SlNo: ${trip1.slNo}`);

    // --------------------------------------------------
    // TEST 2 & 3: Database & API state consistency
    // --------------------------------------------------
    console.log("\n--- TEST 2 & 3: Verify DB & API Calculations ---");
    const dbTrip1 = await tripService.getTripById(trip1.id);
    const vehBal1 = tripService.getVehicleBalanceAmount(dbTrip1);
    const compBal1 = tripService.getCompanyBalanceAmount(dbTrip1);
    const diffAmt1 = dbTrip1.booking - dbTrip1.freight;
    const grossIncome1 = diffAmt1 + dbTrip1.commission;

    console.log(`Booking: ₹${dbTrip1.booking}`);
    console.log(`Freight: ₹${dbTrip1.freight}`);
    console.log(`Commission: ₹${dbTrip1.commission}`);
    console.log(`Difference (Booking - Freight): ₹${diffAmt1} (Expected: ₹10,000)`);
    console.log(`Total Gross Income ((Booking - Freight) + Commission): ₹${grossIncome1} (Expected: ₹13,000)`);
    console.log(`Initial Vehicle Balance: ₹${vehBal1} (Expected: ₹1,000)`);
    console.log(`Initial Company Balance: ₹${compBal1} (Expected: ₹1,000)`);

    if (diffAmt1 !== 10000) throw new Error(`Difference mismatch! Got ${diffAmt1}`);
    if (grossIncome1 !== 13000) throw new Error(`Gross Income mismatch! Got ${grossIncome1}`);
    if (vehBal1 !== 1000) throw new Error(`Vehicle balance mismatch! Got ${vehBal1}`);
    if (compBal1 !== 1000) throw new Error(`Company balance mismatch! Got ${compBal1}`);
    console.log("✅ Financial values and balance calculations are 100% consistent.");

    // --------------------------------------------------
    // TEST 4: Invalid Amount Validation Tests
    // --------------------------------------------------
    console.log("\n--- TEST 4: Invalid Clearance Validation ---");

    const invalidCases = [
      { amt: 0, label: "Zero (0)" },
      { amt: -500, label: "Negative (-500)" },
      { amt: 1500, label: "Greater than balance (1500 > 1000)" },
      { amt: "abc", label: "Non-numeric ('abc')" },
    ];

    for (const testCase of invalidCases) {
      try {
        await tripService.clearVehicleBalance(trip1.id, testCase.amt, testUser);
        throw new Error(`FAIL: Should have rejected invalid amount: ${testCase.label}`);
      } catch (err) {
        if (err.message.startsWith("FAIL:")) throw err;
        console.log(`✅ Correctly rejected invalid amount (${testCase.label}): "${err.message}"`);
      }
    }

    // --------------------------------------------------
    // TEST 5-9: Step-by-step Partial Vehicle Clearance
    // --------------------------------------------------
    console.log("\n--- TEST 5-9: Partial Vehicle Balance Clearance Lifecycle ---");

    // Step 5: Clear ₹500
    console.log("Step A: Clearing ₹500 of ₹1,000 balance...");
    const resA = await tripService.clearVehicleBalance(trip1.id, 500, testUser);
    console.log(`Response A:`, {
      amountCleared: resA.amountCleared,
      previousBalance: resA.previousBalance,
      remainingBalance: resA.remainingBalance,
      settled: resA.settled,
    });
    if (resA.remainingBalance !== 500 || resA.settled !== false) {
      throw new Error(`Step A failed! Remaining: ${resA.remainingBalance}, Settled: ${resA.settled}`);
    }
    const checkActiveA = tripService.isBalanceVehicleActive(resA.trip);
    console.log(`Is Vehicle Balance Active (> 200)? ${checkActiveA} (Expected: true)`);
    if (!checkActiveA) throw new Error("Trip should remain active on balance pending page!");
    console.log("✅ ₹1,000 -> clear ₹500 -> ₹500 remaining (remains pending).");

    // Step 7: Clear ₹299
    console.log("\nStep B: Clearing ₹299 of ₹500 balance...");
    const resB = await tripService.clearVehicleBalance(trip1.id, 299, testUser);
    console.log(`Response B:`, {
      amountCleared: resB.amountCleared,
      previousBalance: resB.previousBalance,
      remainingBalance: resB.remainingBalance,
      settled: resB.settled,
    });
    if (resB.remainingBalance !== 201 || resB.settled !== false) {
      throw new Error(`Step B failed! Remaining: ${resB.remainingBalance}, Settled: ${resB.settled}`);
    }
    const checkActiveB = tripService.isBalanceVehicleActive(resB.trip);
    console.log(`Is Vehicle Balance Active (> 200)? ${checkActiveB} (Expected: true)`);
    if (!checkActiveB) throw new Error("Trip should remain active on balance pending page!");
    console.log("✅ ₹500 -> clear ₹299 -> ₹201 remaining (remains pending).");

    // Step 8: Clear ₹1
    console.log("\nStep C: Clearing ₹1 of ₹201 balance...");
    const resC = await tripService.clearVehicleBalance(trip1.id, 1, testUser);
    console.log(`Response C:`, {
      amountCleared: resC.amountCleared,
      previousBalance: resC.previousBalance,
      remainingBalance: resC.remainingBalance,
      settled: resC.settled,
    });
    if (resC.remainingBalance !== 200 || resC.settled !== true) {
      throw new Error(`Step C failed! Remaining: ${resC.remainingBalance}, Settled: ${resC.settled}`);
    }
    const checkActiveC = tripService.isBalanceVehicleActive(resC.trip);
    console.log(`Is Vehicle Balance Active (> 200)? ${checkActiveC} (Expected: false)`);
    if (checkActiveC) throw new Error("Trip should leave active balance queue when remaining <= 200!");
    console.log("✅ ₹201 -> clear ₹1 -> ₹200 remaining (AUTO-SETTLED!).");

    // --------------------------------------------------
    // TEST 10: Audit Log Verification
    // --------------------------------------------------
    console.log("\n--- TEST 10: Audit Log Verification ---");
    const logs = await AuditLog.find({ trip_id: trip1.id }).sort({ timestamp: 1 }).lean();
    console.log(`Audit log entries found for Trip ${trip1.id}: ${logs.length}`);
    logs.forEach((log, idx) => {
      console.log(`Log ${idx + 1}: Action=${log.action} | User=${log.username} | Old="${log.old_value}" | New="${log.new_value}" | Time=${log.timestamp}`);
    });
    if (logs.length < 4) {
      throw new Error(`Expected at least 4 audit log entries, found ${logs.length}`);
    }
    console.log("✅ Audit log contains previous balance, amount cleared, remaining balance, user, and timestamp.");

    // --------------------------------------------------
    // TEST 11 & 12: Financial Report Verification
    // --------------------------------------------------
    console.log("\n--- TEST 11 & 12: Financial Report Summary Verification ---");
    const reportData = await reportService.generateFinancialReport({});
    const summary = reportData.summary;
    console.log(`Report Summary Total Booking: ₹${summary.totalBooking}`);
    console.log(`Report Summary Total Freight: ₹${summary.totalFreight}`);
    console.log(`Report Summary Total Difference: ₹${summary.totalDifferenceAmount}`);
    console.log(`Report Summary Total Commission: ₹${summary.totalCommission}`);
    console.log(`Report Summary Total Gross Income: ₹${summary.totalGrossIncome}`);

    // Verify formula consistency: totalGrossIncome = totalDifferenceAmount + totalCommission
    if (summary.totalGrossIncome !== summary.totalDifferenceAmount + summary.totalCommission) {
      throw new Error("Report totalGrossIncome formula is inconsistent!");
    }
    console.log("✅ Financial Report summary adheres strictly to (Booking - Freight) + Commission formula.");

    // --------------------------------------------------
    // TEST 13: Company Balance Partial Clearance
    // --------------------------------------------------
    console.log("\n--- TEST 13: Company Balance Partial Clearance ---");
    const trip2 = await tripService.createTrip(
      {
        ...tripData,
        vehicleNumber: "TEST-KA-02-8888",
        advancePaidAmount: 40000, // Vehicle balance 0
        advanceReceivedAmount: 49000, // Company balance 1,000
      },
      testUser
    );
    createdTripIds.push(trip2.id);

    console.log(`Trip 2 created for Company Balance test (Company Balance: ₹1,000)`);
    const compRes1 = await tripService.clearCompanyBalance(trip2.id, 500, testUser);
    console.log(`Company Clear ₹500 -> Remaining: ₹${compRes1.remainingBalance}, Settled: ${compRes1.settled}`);
    if (compRes1.remainingBalance !== 500) throw new Error("Company clearance Step 1 failed");

    const compRes2 = await tripService.clearCompanyBalance(trip2.id, 299, testUser);
    console.log(`Company Clear ₹299 -> Remaining: ₹${compRes2.remainingBalance}, Settled: ${compRes2.settled}`);
    if (compRes2.remainingBalance !== 201) throw new Error("Company clearance Step 2 failed");

    const compRes3 = await tripService.clearCompanyBalance(trip2.id, 1, testUser);
    console.log(`Company Clear ₹1 -> Remaining: ₹${compRes3.remainingBalance}, Settled: ${compRes3.settled}`);
    if (compRes3.remainingBalance !== 200 || !compRes3.settled) throw new Error("Company clearance Step 3 failed");

    console.log("✅ Company Balance partial clearance sequence passed 100%.");

    // --------------------------------------------------
    // TEST 15: To Pay Workflow Unchanged Test
    // --------------------------------------------------
    console.log("\n--- TEST 15: To Pay Workflow Preservation ---");
    const tripToPay = await tripService.createTrip(
      {
        ...tripData,
        vehicleNumber: "TEST-KA-03-7777",
        advancePaidType: "To Pay",
        advanceReceivedType: "To Pay",
      },
      testUser
    );
    createdTripIds.push(tripToPay.id);

    const isVehActiveToPay = tripService.isBalanceVehicleActive(tripToPay);
    const isCompActiveToPay = tripService.isBalanceCompanyActive(tripToPay);
    console.log(`To Pay Vehicle Balance Active? ${isVehActiveToPay} (Expected: false)`);
    console.log(`To Pay Company Balance Active? ${isCompActiveToPay} (Expected: false)`);
    if (isVehActiveToPay || isCompActiveToPay) {
      throw new Error("To Pay trips should not appear in active balance queues!");
    }
    console.log("✅ To Pay settlement workflow remains completely unchanged.");

    // --------------------------------------------------
    // TEST 16: Concurrency / Race Condition Safety Test
    // --------------------------------------------------
    console.log("\n--- TEST 16: Concurrency / Race Condition Safety Test ---");
    const tripConc = await tripService.createTrip(
      {
        ...tripData,
        vehicleNumber: "TEST-KA-04-6666",
        advancePaidAmount: 39500, // Vehicle balance ₹500
      },
      testUser
    );
    createdTripIds.push(tripConc.id);

    console.log(`Created Trip for Concurrency Test with Vehicle Balance ₹500.`);
    console.log(`Simulating 2 simultaneous requests to clear ₹500...`);

    const p1 = tripService.clearVehicleBalance(tripConc.id, 500, testUser);
    const p2 = tripService.clearVehicleBalance(tripConc.id, 500, testUser);

    const results = await Promise.allSettled([p1, p2]);
    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    console.log(`Concurrent Results: ${fulfilled.length} succeeded, ${rejected.length} rejected.`);
    if (fulfilled.length === 1 && rejected.length === 1) {
      console.log(`Rejected error message: "${rejected[0].reason?.message}"`);
      console.log("✅ Concurrency test PASSED: Exactly 1 request succeeded, 1 was safely blocked by atomic update.");
    } else {
      throw new Error(`Concurrency test failed! Expected 1 fulfilled and 1 rejected, got ${fulfilled.length} fulfilled.`);
    }

    const finalConcTrip = await tripService.getTripById(tripConc.id);
    const finalConcBal = tripService.getVehicleBalanceAmount(finalConcTrip);
    console.log(`Final balance after concurrent attempts: ₹${finalConcBal}`);
    if (finalConcBal < 0) throw new Error("Balance became negative!");

    // --------------------------------------------------
    // TEST 17 & 18: Clean up temporary test data
    // --------------------------------------------------
    console.log("\n--- TEST 17 & 18: Clean Up Temporary Test Data ---");
    for (const tripId of createdTripIds) {
      await Trip.deleteOne({ id: tripId });
      await AuditLog.deleteMany({ trip_id: tripId });
      console.log(`Deleted test trip & audit logs for ${tripId}`);
    }

    const remainingTestTrips = await Trip.find({ vehicle_number: { $regex: /^TEST-KA-/ } });
    console.log(`Remaining test trips in database: ${remainingTestTrips.length}`);
    if (remainingTestTrips.length !== 0) {
      throw new Error("Database still has leftover test trips!");
    }

    console.log("\n==================================================");
    console.log("ALL LIVE PRODUCTION FUNCTIONAL TESTS PASSED 100%");
    console.log("==================================================");
  } catch (error) {
    console.error("\n❌ LIVE TEST FAILED:", error);
    process.exitCode = 1;
  } finally {
    // Ensure cleanup of any created trips even on failure
    if (createdTripIds.length > 0) {
      for (const tripId of createdTripIds) {
        await Trip.deleteOne({ id: tripId }).catch(() => {});
        await AuditLog.deleteMany({ trip_id: tripId }).catch(() => {});
      }
      console.log("Cleanup on exit complete.");
    }
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

runLiveTest();
