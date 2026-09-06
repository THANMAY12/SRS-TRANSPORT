const TOKEN_KEY = "tcms_auth_token";
const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

function getUrl(endpoint) {
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    return endpoint;
  }
  return API_BASE_URL ? `${API_BASE_URL}${endpoint}` : endpoint;
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(endpoint, options = {}) {
  const token = getStoredToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = getUrl(endpoint);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    removeStoredToken();
    window.dispatchEvent(new Event("auth:unauthorized"));
    throw new Error("Session expired. Please log in again.");
  }

  const data = await response.json();

  if (!response.ok) {
    const errorMsg =
      typeof data.message === "string" && data.message
        ? data.message
        : typeof data.error === "string"
          ? data.error
          : typeof data.error?.message === "string"
            ? data.error.message
            : "An error occurred during request";
    const err = new Error(errorMsg);
    err.status = response.status;
    err.response = { status: response.status, data };
    throw err;
  }

  return data;
}

export const api = {
  // Auth
  login: (username, password) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  getCurrentUser: () => request("/api/auth/me"),

  // Dashboard
  getDashboardStats: () => request("/api/dashboard/stats"),

  // Trips
  getTrips: (params) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          query.append(key, String(val));
        }
      });
    }
    const qStr = query.toString();
    return request(`/api/trips${qStr ? "?" + qStr : ""}`);
  },

  getPendingCommissionTrips: () => request("/api/trips/pending-commission"),
  getPendingAdvanceVehicleTrips: () => request("/api/trips/pending-advance-vehicle"),
  getPendingAdvanceCompanyTrips: () => request("/api/trips/pending-advance-company"),
  getBalanceVehicleTrips: () => request("/api/trips/balance-vehicle"),
  getBalanceCompanyTrips: () => request("/api/trips/balance-company"),
  getCompletedTrips: () => request("/api/trips/completed"),
  getPendingApprovals: () => request("/api/trips/pending-approvals"),

  createTrip: (tripData) =>
    request("/api/trips", {
      method: "POST",
      body: JSON.stringify(tripData),
    }),

  updateTrip: (id, tripData) =>
    request(`/api/trips/${id}`, {
      method: "PUT",
      body: JSON.stringify(tripData),
    }),

  approveTrip: (id) =>
    request(`/api/trips/${id}/approve`, {
      method: "PATCH",
    }),

  rejectTrip: (id, reason) =>
    request(`/api/trips/${id}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    }),

  clearVehicleBalance: (id, amountToClear, clearedDate, remarks) => {
    const body =
      typeof amountToClear === "object" && amountToClear !== null
        ? amountToClear
        : { amountToClear, clearedDate, remarks };
    return request(`/api/trips/${id}/clear-vehicle-balance`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  clearCompanyBalance: (id, amountToClear, clearedDate, remarks) => {
    const body =
      typeof amountToClear === "object" && amountToClear !== null
        ? amountToClear
        : { amountToClear, clearedDate, remarks };
    return request(`/api/trips/${id}/clear-company-balance`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  deleteTrip: (id) =>
    request(`/api/trips/${id}`, {
      method: "DELETE",
    }),

  // Reports
  getReports: (params) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val) query.append(key, String(val));
    });
    return request(`/api/reports?${query.toString()}`);
  },

  // Workers
  getWorkers: () => request("/api/workers"),
  createWorker: (workerData) =>
    request("/api/workers", {
      method: "POST",
      body: JSON.stringify(workerData),
    }),
  updateWorker: (id, data) =>
    request(`/api/workers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteWorker: (id) =>
    request(`/api/workers/${id}`, {
      method: "DELETE",
    }),

  // Audit Logs
  getAuditLogs: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.append(key, val);
      }
    });
    const qStr = query.toString();
    return request(`/api/audit-logs${qStr ? `?${qStr}` : ""}`);
  },

  // Backup
  downloadBackup: async () => {
    const token = getStoredToken();
    const response = await fetch(getUrl("/api/backup"), {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transport_system_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
  },
};
