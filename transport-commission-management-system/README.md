# Transport Commission Management System (TCMS)

A production-grade, corporate enterprise management application designed for transport commission agents, logistics operators, and fleet coordinators. TCMS streamlines daily transport logging, commission tracking, vehicle freight advances, company booking collections, balance clearances, financial analytics, and immutable audit compliance.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Trip & Financial Workflow](#trip--financial-workflow)
- [User Roles & Permissions](#user-roles--permissions)
- [Financial Rules & Calculations](#financial-rules--calculations)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Backend Architecture](#backend-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Environment Configuration](#environment-configuration)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [Production Build & Verification](#production-build--verification)
- [Reporting & Data Exports](#reporting--data-exports)
- [Security Features](#security-features)
- [Audit Logging](#audit-logging)
- [Fresh Installation & Database State](#fresh-installation--database-state)
- [Business Workflow Examples](#business-workflow-examples)
- [API Reference](#api-reference)
- [Deployment Guidelines](#deployment-guidelines)
- [Development Guidelines](#development-guidelines)
- [Git Commit Convention](#git-commit-convention)

---

## Overview

The **Transport Commission Management System (TCMS)** is a specialized operations platform engineered to manage transport trip lifecycles from initial vehicle loading to final financial clearance. It provides real-time visibility into pending agent commissions, vehicle driver balance payouts, company booking collections, and gross profit margins.

---

## Key Features

- **Secure Authentication & RBAC**: Role-based access control distinguishing Administrators from Operational Workers.
- **Daily Trip Entry**: Fast, structured form entry for date, vehicle number, route, freight, transport name, booking amount, commission, and advances.
- **Pending Work Queues**:
  - **Pending Commission**: Highlights trips awaiting commission assignment.
  - **Pending Vehicle Advance**: Identifies trips needing vehicle advance payment type records.
  - **Pending Company Advance**: Identifies trips needing company advance collection type records.
- **Balance Clearance Queues**:
  - **Vehicle Balance Queue**: Tracks outstanding driver freight balances exceeding ₹200.
  - **Company Balance Queue**: Tracks outstanding company booking collections exceeding ₹200.
- **Completed Trips Archive**: Auto-archives fully settled trips.
- **Operations Command Dashboard**: Real-time KPI metrics, pending queue counts, balance totals, and latest trip records.
- **Action Center Notification Drawer**: Quick slide-over drawer highlighting operational items requiring immediate attention.
- **Financial Reports & Analytics**: Dynamic filtering by daily, weekly, monthly, custom date range, vehicle number, or transport name.
- **Excel & PDF Exports**: One-click generation of formatted Excel spreadsheets (`.xlsx`) and landscape PDF documents (`.pdf`).
- **Database Excel Export**: Formatted 3-sheet Excel workbook export (`Trips`, `Users & Workers`, `Audit Logs`) for administrative reporting.
- **JSON Disaster Recovery Backup**: Raw database snapshot download for system backups.
- **System Audit Trail**: Immutable logging of logins, trip creations, updates, deletions, and balance clearances.
- **Worker Management**: Admin tools to create, edit, activate/deactivate worker user accounts.
- **Print Views**: Optimized print layouts for financial reports, audit logs, and trip lists.
- **Session Protection**: Automatic token validation and unauthorized session handling.

---

## Trip & Financial Workflow

Each transport trip progresses through a strict, deterministic business lifecycle:

```text
[ Daily Entry ] ──> [ Pending Commission ] ──> [ Pending Vehicle Advance ]
                                                          │
                                                          ▼
[ Completed Archive ] <── [ Balance Clearance ] <── [ Pending Company Advance ]
```

### Workflow Rules:

1. **Daily Entry**: Trip recorded with initial freight, booking, and route details.
2. **Commission Assignment**: Trip requires valid commission amount entry.
3. **Vehicle Advance Settlement**: Advance paid type (`Cash`, `PhonePe`, `To Pay`) recorded.
4. **Company Advance Settlement**: Advance received type (`Cash`, `PhonePe`, `To Pay`) recorded.
5. **Balance Evaluation**:
   - **Vehicle Balance** = $\text{Freight} - \text{Advance Paid Amount}$
   - **Company Balance** = $\text{Booking} - \text{Advance Received Amount}$
6. **Completion Thresholds**:
   - Monetary Balance $\le ₹200$ (inclusive) $\rightarrow$ Treated as **Settled**.
   - Monetary Balance $> ₹200$ $\rightarrow$ Remains **Pending Clearance**.
   - Payment Type `"To Pay"` $\rightarrow$ Treated as a **Settled Business Obligation** at destination.

---

## User Roles & Permissions

| Feature / Action | Admin | Worker |
| :--- | :---: | :---: |
| View Dashboard & Operations Queues | Yes | Yes |
| Create New Daily Trip Entries | Yes | Yes |
| Update Pending Trips & Assign Commission | Yes | Yes |
| Clear Vehicle & Company Balances | Yes | Yes |
| View Completed Trips Archive | Yes | Yes |
| View Financial Reports & Export (Excel/PDF) | Yes | Yes |
| Edit Completed Trips | Yes | **No** (Blocked) |
| Delete Trip Records | Yes | **No** (Blocked) |
| Access System Audit Logs | Yes | **No** (Hidden & Blocked) |
| Export Database to Excel / JSON Backup | Yes | **No** (Hidden & Blocked) |
| Create, Edit & Delete Worker Users | Yes | **No** (Hidden & Blocked) |

---

## Financial Rules & Calculations

Financial calculations follow authoritative business formulas enforced consistently across the backend services and frontend utilities:

$$\text{Vehicle Balance} = \text{Freight} - \text{Advance Paid Amount}$$

$$\text{Company Balance} = \text{Booking} - \text{Advance Received Amount}$$

$$\text{Difference Amount} = \text{Booking} - \text{Freight}$$

$$\text{Total Gross Income} = \text{Booking} - \text{Commission}$$

### Numerical Example:

Given a trip entry:
- **Booking**: ₹50,000
- **Freight**: ₹40,000
- **Commission**: ₹3,000
- **Advance Received**: ₹20,000
- **Advance Paid**: ₹15,000

Calculated Financial Results:
- **Difference Amount**: $50,000 - 40,000 = \mathbf{₹10,000}$
- **Total Gross Income**: $50,000 - 3,000 = \mathbf{₹47,000}$
- **Vehicle Balance**: $40,000 - 15,000 = \mathbf{₹25,000}$ ($> ₹200 \rightarrow$ Pending Vehicle Balance)
- **Company Balance**: $50,000 - 20,000 = \mathbf{₹30,000}$ ($> ₹200 \rightarrow$ Pending Company Balance)

---

## Technology Stack

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js 4.21
- **Database ORM**: Mongoose 9.9
- **Authentication**: JSON Web Tokens (`jsonwebtoken` 9.0) & Password Hashing (`bcryptjs` 3.0)
- **Security**: Helmet 8.3, CORS 2.8, Express Rate Limit 8.6
- **Development Tooling**: Nodemon, ESLint 8.57, Prettier 3.9

### Frontend
- **Framework**: React 19.0 (Single Page Application)
- **Build Tool**: Vite 6.2
- **Routing**: React Router DOM 7.1
- **Styling**: Vanilla CSS, TailwindCSS 4.1
- **Icons & Animation**: Lucide React 0.546, Motion 12.23
- **Reporting & Exports**: SheetJS (`xlsx` 0.18), jsPDF 4.2, jsPDF-AutoTable 5.0

### Database
- **Database Engine**: MongoDB (Local or MongoDB Atlas cluster)

---

## Project Structure

```text
transport-commission-management-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── constants.js          # Centralized backend business constants
│   │   │   ├── database.js           # Mongoose MongoDB connection & Admin seed
│   │   │   └── environment.js        # Environment variable loader
│   │   ├── controllers/
│   │   │   ├── auditLogController.js # Audit log retrieval controller
│   │   │   ├── authController.js     # Login & auth me controllers
│   │   │   ├── reportController.js   # Dashboard stats & financial report query
│   │   │   ├── tripController.js     # Trip CRUD & balance clearance controllers
│   │   │   └── workerController.js   # Worker management controllers
│   │   ├── middleware/
│   │   │   └── authMiddleware.js     # JWT verification & requireAdmin guard
│   │   ├── models/
│   │   │   ├── AuditLog.js           # Audit log Mongoose schema
│   │   │   ├── Trip.js               # Trip Mongoose schema
│   │   │   └── User.js               # User/Worker Mongoose schema
│   │   ├── routes/
│   │   │   ├── auditLogRoutes.js     # /api/audit-logs endpoints
│   │   │   ├── authRoutes.js         # /api/auth endpoints
│   │   │   ├── index.js              # Central API router (/api/dashboard/stats, /api/backup)
│   │   │   ├── reportRoutes.js       # /api/reports endpoints
│   │   │   ├── tripRoutes.js         # /api/trips endpoints
│   │   │   └── workerRoutes.js       # /api/workers endpoints
│   │   ├── services/
│   │   │   ├── auditLogService.js    # Audit log creation & fetch logic
│   │   │   ├── reportService.js      # Financial report aggregation logic
│   │   │   ├── tripService.js        # Trip business logic & balance predicates
│   │   │   └── workerService.js      # Worker account business logic
│   │   ├── app.js                    # Express app configuration & middleware pipeline
│   │   └── server.js                 # Server entry point
│   ├── .env.example                  # Backend environment variable template
│   └── package.json                  # Backend dependencies & npm scripts
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── modals/               # AddWorker, ClearAdvance, EnterCommission, TripDetail
│   │   │   └── ui/                   # ConfirmModal, DataTable, MetricCard, Modal, PageHeader, StatusBadge, Toast
│   │   ├── constants/
│   │   │   └── businessConstants.js  # Centralized frontend business constants
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Authentication state context provider
│   │   ├── layouts/
│   │   │   ├── Header.jsx            # Top navigation header bar
│   │   │   ├── NotificationDrawer.jsx# Operations action center slide-over
│   │   │   └── Sidebar.jsx           # Left navigation sidebar
│   │   ├── lib/
│   │   │   └── utils.js              # Currency formatters, date formatters, financial predicates
│   │   ├── pages/
│   │   │   ├── AuditLogPage.jsx      # System audit trail & database Excel export
│   │   │   ├── BalanceCompanyPage.jsx# Outstanding company collection queue
│   │   │   ├── BalanceVehiclePage.jsx# Outstanding vehicle driver balance queue
│   │   │   ├── CompletedTripsPage.jsx# Archived completed trips view
│   │   │   ├── DailyEntryPage.jsx    # Transport trip logging & editing page
│   │   │   ├── Dashboard.jsx         # Executive operations command center
│   │   │   ├── LoginModal.jsx        # Login portal authentication dialog
│   │   │   ├── ManageWorkersPage.jsx # Worker account management workspace
│   │   │   ├── PendingAdvanceCompanyPage.jsx # Pending company advance queue
│   │   │   ├── PendingAdvanceVehiclePage.jsx # Pending vehicle advance queue
│   │   │   ├── PendingCommissionPage.jsx     # Pending agent commission queue
│   │   │   └── ReportsPage.jsx       # Financial reporting & export workspace
│   │   ├── services/
│   │   │   └── api.js                # Frontend HTTP fetch API service layer
│   │   ├── App.jsx                   # Application shell & route coordinator
│   │   ├── main.jsx                  # React application mount entry point
│   │   └── index.css                 # Global CSS & Tailwind styling setup
│   └── package.json                  # Frontend dependencies & npm scripts
│
├── .env.example                      # Root environment variable template
├── .gitignore                        # Git exclusion rules
├── package.json                      # Workspace dependencies (Husky, lint-staged)
└── README.md                         # Project documentation
```

---

## Backend Architecture

The backend implements a clean Layered MVC / Service Architecture:

$$\text{Routes} \longrightarrow \text{Controllers} \longrightarrow \text{Services} \longrightarrow \text{Mongoose Models} \longrightarrow \text{MongoDB}$$

- **Middleware Layer**:
  - `helmet()`: Enforces HTTP security headers.
  - `cors()`: Handles cross-origin requests.
  - `express.json()`: Parses incoming JSON request payloads.
  - `authenticateToken`: Verifies JWT Bearer tokens from the `Authorization` header.
  - `requireAdmin`: Guards routes restricted to users with the `ADMIN` role.
- **Error Handling**: Centralized global error handling middleware in `app.js` returns formatted JSON error responses (`{ error: message }`).

---

## Frontend Architecture

- **React 19 SPA**: Client-side single-page application built with Vite.
- **AuthContext**: Manages authentication tokens (`tcms_auth_token`), stored user sessions, and authorization states.
- **API Service Layer (`api.js`)**: Abstracted fetch wrapper handling token injection, HTTP errors, and automatic 401 logout handling.
- **Reusable UI Library**: Standardized component library (`DataTable`, `PageHeader`, `MetricCard`, `StatusBadge`, `Modal`, `ConfirmModal`, `Toast`) for design consistency.

---

## Environment Configuration

Create a `.env` file in the `backend/` directory based on `.env.example`:

```env
# Backend Server Port
PORT=3000

# MongoDB Database Connection String
MONGODB_URI=mongodb://127.0.0.1:27017/transport_system

# JWT Secret Key for Session Token Signing
JWT_SECRET=your_jwt_secret_key_here

# Environment Mode
NODE_ENV=development

# Initial Administrator Seed Credentials (Used only on fresh DB setup)
INITIAL_ADMIN_USERNAME=admin
INITIAL_ADMIN_PASSWORD=your_secure_admin_password_here
```

> **IMPORTANT**: Never commit `.env` files containing real production credentials to Git repositories. `.env` is listed in `.gitignore`.

---

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- MongoDB instance (local or MongoDB Atlas connection URL)

### Step 1: Clone Repository
```bash
git clone https://github.com/THANMAY12/SRS-TRANSPORT.git
cd transport-commission-management-system
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## Running the Application

### Development Mode

1. **Start Backend Server**:
   ```bash
   cd backend
   npm run dev
   ```
   Backend will start on `http://localhost:3000` (Health check: `http://localhost:3000/api/health`).

2. **Start Frontend Server**:
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will start on `http://localhost:5173`. Vite proxies `/api` calls directly to `http://localhost:3000`.

---

## Production Build & Verification

Before committing or deploying code, run the verification commands across both projects:

### Backend Verification:
```bash
cd backend
npm run lint
npm run format:check
```

### Frontend Verification:
```bash
cd frontend
npm run lint
npm run format:check
npm run build
```

---

## Reporting & Data Exports

TCMS provides dual export options:

1. **Financial Reports Workspace (`/reports`)**:
   - **Excel Export**: Exports filtered trip records to an Excel `.xlsx` spreadsheet.
   - **PDF Export**: Generates a landscape PDF summary document with headers and data tables.
   - **Print View**: Browser print layout optimized for paper/PDF printing.

2. **Database Administration Exports (`/audit-logs`)**:
   - **Export Database to Excel (`.xlsx`)**: Generates a 3-sheet workbook (`Trips`, `Users & Workers`, `Audit Logs`) for human-readable business reporting.
   - **Download JSON DB Backup (`.json`)**: Downloads a raw database snapshot for disaster recovery backups.

---

## Security Features

- **JWT Authentication**: Signed JWT tokens stored securely on the client.
- **Password Security**: Passwords hashed using `bcryptjs` before database persistence.
- **Role-Based Access Control**: Strict backend endpoint enforcement (`requireAdmin`) preventing unauthorized Worker execution.
- **Rate Limiting**: `express-rate-limit` prevents brute-force login attempts.
- **HTTP Security Headers**: `helmet` enforces protective HTTP response headers.

---

## Audit Logging

Every critical system event is recorded in the `AuditLog` collection:
- `LOGIN`: User authentication events.
- `CREATE_TRIP`: New trip registration.
- `UPDATE_TRIP`: Trip field updates.
- `CLEAR_VEHICLE_BALANCE`: Vehicle balance clearances.
- `CLEAR_COMPANY_BALANCE`: Company balance clearances.
- `DELETE_TRIP`: Trip record deletions (Admin only).
- `CREATE_WORKER` / `UPDATE_WORKER` / `DELETE_WORKER`: Worker account management.

---

## Fresh Installation & Database State

A newly initialized TCMS system starts with a **clean operational database**:
- **Trips**: 0 records
- **Audit Logs**: 0 records (accumulates runtime actions)
- **Workers**: 0 demo workers
- **Initial Administrator**: Automatically seeded from `INITIAL_ADMIN_USERNAME` and `INITIAL_ADMIN_PASSWORD` environment variables on first backend startup.

---

## Business Workflow Examples

### Scenario 1: Standard Cash Settlement
- **Booking**: ₹50,000 | **Freight**: ₹40,000 | **Commission**: ₹3,000
- **Adv Rec**: ₹20,000 (`Cash`) | **Adv Paid**: ₹15,000 (`Cash`)
- **Vehicle Bal**: ₹25,000 ($> ₹200 \rightarrow$ Pending Vehicle Balance)
- **Company Bal**: ₹30,000 ($> ₹200 \rightarrow$ Pending Company Balance)

### Scenario 2: Small Balance ($\le ₹200$) Auto-Clearance
- **Freight**: ₹10,000 | **Adv Paid**: ₹9,850 (`Cash`)
- **Vehicle Bal**: $10,000 - 9,850 = \mathbf{₹150}$ ($\le ₹200$)
- **Result**: Vehicle obligation is treated as **Settled** and does not enter the Vehicle Balance queue.

### Scenario 3: Destination "To Pay" Agreement
- **Freight**: ₹45,000 | **Adv Paid**: ₹0 | **Adv Paid Type**: `"To Pay"`
- **Result**: Driver payout is settled at destination. The trip does not enter the Vehicle Balance queue.

---

## API Reference

### Auth Routes (`/api/auth`)
- `POST /api/auth/login`: User login endpoint.
- `GET /api/auth/me`: Current user session profile.

### Trip Routes (`/api/trips`)
- `GET /api/trips`: Fetch all trips.
- `GET /api/trips/pending-commission`: Fetch pending commission trips.
- `GET /api/trips/pending-advance-vehicle`: Fetch pending vehicle advance trips.
- `GET /api/trips/pending-advance-company`: Fetch pending company advance trips.
- `GET /api/trips/balance-vehicle`: Fetch active vehicle balance trips (> ₹200).
- `GET /api/trips/balance-company`: Fetch active company balance trips (> ₹200).
- `GET /api/trips/completed`: Fetch completed trips.
- `POST /api/trips`: Create new trip.
- `PUT /api/trips/:id`: Update trip details.
- `POST /api/trips/:id/clear-vehicle-balance`: Mark vehicle balance as cleared.
- `POST /api/trips/:id/clear-company-balance`: Mark company balance as cleared.
- `DELETE /api/trips/:id`: Delete trip (Admin only).

### Report Routes (`/api/reports`)
- `GET /api/reports`: Financial report query (`period`, `startDate`, `endDate`, `vehicleNumber`, `transport`).

### Worker Routes (`/api/workers`)
- `GET /api/workers`: Fetch worker users (Admin only).
- `POST /api/workers`: Create worker user (Admin only).
- `PUT /api/workers/:id`: Update worker user (Admin only).
- `DELETE /api/workers/:id`: Delete worker user (Admin only).

### System Audit Logs (`/api/audit-logs`)
- `GET /api/audit-logs`: Fetch system audit log entries (Admin only).

---

## Deployment Guidelines

Deployment configuration is environment-specific and should be configured according to the target cloud or server infrastructure (e.g., Docker containerization, PM2 process management, Nginx reverse proxying, MongoDB Atlas database hosting).

---

## Development Guidelines

- **Source of Truth**: Keep business logic and financial formulas centralized in backend services (`tripService.js`) and frontend helpers (`utils.js`).
- **Thin Controllers**: Controllers handle request parsing and response formatting. Business logic resides in services.
- **Zero Mock Data**: All dashboard counts, table rows, and metrics must query backend APIs.
- **Git Safety**: Do not commit secrets or `.env` files. Verify `git status` before pushing changes.

---

## Git Commit Convention

This repository follows Conventional Commit standards:

- `feat:` New feature implementation
- `fix:` Bug fix or logic correction
- `refactor:` Code restructuring without functional change
- `style:` UI styling adjustments
- `chore:` Dependency or setup updates
- `docs:` Documentation updates

---

*Transport Commission Management System (TCMS) Documentation*
