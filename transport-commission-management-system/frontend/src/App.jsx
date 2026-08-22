import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Sidebar } from "./layouts/Sidebar";
import { Header } from "./layouts/Header";
import { Dashboard } from "./pages/Dashboard";
import { DailyEntryPage } from "./pages/DailyEntryPage";
import { PendingCommissionPage } from "./pages/PendingCommissionPage";
import { PendingAdvanceVehiclePage } from "./pages/PendingAdvanceVehiclePage";
import { PendingAdvanceCompanyPage } from "./pages/PendingAdvanceCompanyPage";
import { BalanceVehiclePage } from "./pages/BalanceVehiclePage";
import { BalanceCompanyPage } from "./pages/BalanceCompanyPage";
import { CompletedTripsPage } from "./pages/CompletedTripsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { AuditLogPage } from "./pages/AuditLogPage";
import { ManageWorkersPage } from "./pages/ManageWorkersPage";
import { LoginModal } from "./pages/LoginModal";
import { NotificationDrawer } from "./layouts/NotificationDrawer";
import { api } from "./services/api";

function MainLayout() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");

  const [stats, setStats] = useState(null);
  const [trips, setTrips] = useState([]);
  const [nextSlNo, setNextSlNo] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const activePage = location.pathname.substring(1) || "dashboard";

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsRefreshing(true);
    try {
      const [statsData, tripsData] = await Promise.all([api.getDashboardStats(), api.getTrips()]);
      setStats(statsData);
      setTrips(tripsData);

      if (tripsData.length > 0) {
        const maxSl = Math.max(...tripsData.map((t) => t.slNo));
        setNextSlNo(maxSl + 1);
      } else {
        setNextSlNo(1);
      }
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Trip operations
  const handleCreateTrip = async (data) => {
    await api.createTrip(data);
    await fetchData();
  };

  const handleUpdateTrip = async (id, data) => {
    await api.updateTrip(id, data);
    await fetchData();
  };

  const handleDeleteTrip = async (id) => {
    await api.deleteTrip(id);
    await fetchData();
  };

  const handleClearVehicleBalance = async (id, amountToClear, clearedDate, remarks) => {
    const res = await api.clearVehicleBalance(id, amountToClear, clearedDate, remarks);
    await fetchData();
    return res;
  };

  const handleClearCompanyBalance = async (id, amountToClear, clearedDate, remarks) => {
    const res = await api.clearCompanyBalance(id, amountToClear, clearedDate, remarks);
    await fetchData();
    return res;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-400">Loading Transport System...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginModal />;
  }

  const pageTitles = {
    dashboard: {
      title: "Dashboard",
      subtitle: "Today's transport operations and financial overview",
    },
    "daily-entry": {
      title: "Daily entry log",
      subtitle: "Auto-generated Sl.No & trip entries auto-saved",
    },
    "pending-commission": {
      title: "Pending commission",
      subtitle: "Trips requiring agent commission input",
    },
    "pending-advance-vehicle": {
      title: "Pending vehicle advance",
      subtitle: "Trips with missing vehicle advance payment type",
    },
    "pending-advance-company": {
      title: "Pending company advance",
      subtitle: "Trips with missing company advance collection type",
    },
    "balance-vehicle": {
      title: "Vehicle balance (> ₹200)",
      subtitle: "Freight balances > ₹200 pending clearance",
    },
    "balance-company": {
      title: "Company balance (> ₹200)",
      subtitle: "Booking balances > ₹200 pending collection",
    },
    completed: {
      title: "Completed trips archive",
      subtitle: "Fully settled transport trips",
    },
    reports: {
      title: "Financial reports & analytics",
      subtitle: "Daily, weekly, monthly reports with Excel & PDF exports",
    },
    "audit-logs": {
      title: "System audit trail",
      subtitle: "Complete history of user actions and database events",
    },
    "manage-workers": {
      title: "Manage workers & credentials",
      subtitle: "Manage workers, passwords, and system permissions",
    },
  };

  const currentHeaderInfo = pageTitles[activePage] || {
    title: "Transport Commission System",
    subtitle: "Private Logistics Management Portal",
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-slate-900 flex flex-col lg:flex-row antialiased selection:bg-blue-600 selection:text-white">
      <Sidebar
        activePage={activePage}
        setActivePage={(p) => navigate(`/${p}`)}
        stats={stats}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          pageTitle={currentHeaderInfo.title}
          pageSubtitle={currentHeaderInfo.subtitle}
          onMenuClick={() => setSidebarOpen(true)}
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
          onRefresh={fetchData}
          isRefreshing={isRefreshing}
          onOpenNotifications={() => setNotificationsOpen(true)}
          stats={stats}
        />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <Dashboard
                  stats={stats}
                  latestTrips={trips.slice(0, 20)}
                  onNavigatePage={(p) => navigate(`/${p}`)}
                  globalSearch={globalSearch}
                  setGlobalSearch={setGlobalSearch}
                />
              }
            />
            <Route
              path="/daily-entry"
              element={
                <DailyEntryPage
                  trips={trips}
                  nextSlNo={nextSlNo}
                  onCreateTrip={handleCreateTrip}
                  onUpdateTrip={handleUpdateTrip}
                  onDeleteTrip={handleDeleteTrip}
                  globalSearch={globalSearch}
                  setGlobalSearch={setGlobalSearch}
                />
              }
            />
            <Route
              path="/pending-commission"
              element={
                <PendingCommissionPage
                  trips={trips}
                  onUpdateTrip={handleUpdateTrip}
                  globalSearch={globalSearch}
                  setGlobalSearch={setGlobalSearch}
                />
              }
            />
            <Route
              path="/pending-advance-vehicle"
              element={
                <PendingAdvanceVehiclePage
                  trips={trips}
                  onUpdateTrip={handleUpdateTrip}
                  globalSearch={globalSearch}
                  setGlobalSearch={setGlobalSearch}
                />
              }
            />
            <Route
              path="/pending-advance-company"
              element={
                <PendingAdvanceCompanyPage
                  trips={trips}
                  onUpdateTrip={handleUpdateTrip}
                  globalSearch={globalSearch}
                  setGlobalSearch={setGlobalSearch}
                />
              }
            />
            <Route
              path="/balance-vehicle"
              element={
                <BalanceVehiclePage
                  trips={trips}
                  onClearBalance={handleClearVehicleBalance}
                  globalSearch={globalSearch}
                  setGlobalSearch={setGlobalSearch}
                />
              }
            />
            <Route
              path="/balance-company"
              element={
                <BalanceCompanyPage
                  trips={trips}
                  onClearBalance={handleClearCompanyBalance}
                  globalSearch={globalSearch}
                  setGlobalSearch={setGlobalSearch}
                />
              }
            />
            <Route
              path="/completed"
              element={
                <CompletedTripsPage
                  trips={trips}
                  globalSearch={globalSearch}
                  setGlobalSearch={setGlobalSearch}
                />
              }
            />
            <Route path="/reports" element={<ReportsPage />} />
            {user?.role === "ADMIN" && <Route path="/audit-logs" element={<AuditLogPage />} />}
            {user?.role === "ADMIN" && (
              <Route path="/manage-workers" element={<ManageWorkersPage />} />
            )}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>

      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        stats={stats}
        onNavigatePage={(p) => navigate(`/${p}`)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
