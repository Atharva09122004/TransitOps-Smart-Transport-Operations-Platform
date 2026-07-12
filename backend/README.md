# Backend

Express API for the transport operations platform.

## Structure

```text
backend/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── config/
│   │   └── prisma.js
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── app.js
│   └── server.js
├── .env
└── package.json
```

## Scripts

```bash
npm run dev
npm start
```

## Prisma

The Prisma client is initialized in [src/config/prisma.js](src/config/prisma.js) using `@prisma/adapter-pg` and `DATABASE_URL` from `.env`.

## Deploy note: UserRole DRIVER → DISPATCHER

JWTs issued before this migration embed `role: "DRIVER"` in the payload. After deploy, those tokens fail every `requireRole("DISPATCHER")` check with **403** — expected, not a bug. Users with this role must **log out and log back in** after `prisma migrate deploy` so a fresh token with `role: "DISPATCHER"` is issued. Do not support both role strings long-term in RBAC.

### Post-deploy verification

1. `prisma migrate deploy` succeeds; `SELECT DISTINCT role FROM "User"` shows `DISPATCHER` (no `DRIVER`).
2. Log in as `driver@transitops.com` — sidebar badge reads **Dispatcher**; menu shows Dashboard, Trips, Fuel & Expenses only.
3. `GET /api/dashboard` as that user returns fleet-wide dispatch data (`totalTrips`, `draftTrips`, `availableVehicles`, `recentTrips`, etc.), not personal-driver stats.
4. A stale JWT with `role: "DRIVER"` returns **403** on protected routes — confirms re-login is required.

## Manual verification notes

### cancelTrip — DRAFT cancellation preserves vehicle/driver status

1. Dispatch trip A for vehicle V1 (V1 becomes `ON_TRIP`).
2. Create a separate DRAFT trip B also assigned to V1 (allowed while V1 is `ON_TRIP`).
3. `PATCH /api/trips/:id/cancel` on trip B with a reason.
4. **Expect:** trip B is `CANCELLED`; V1 remains `ON_TRIP` (not reset to `AVAILABLE`).

### createTrip — availability and capacity checks at creation

1. Set a vehicle to `IN_SHOP`, then `POST /api/trips` using that vehicle → **400** `"Vehicle is not available"`.
2. Set a driver to `SUSPENDED`, then `POST /api/trips` using that driver → **400** `"Driver is not available"`.
3. `POST /api/trips` with `cargoWeightKg` greater than the vehicle's `capacityKg` → **400** `"Cargo weight exceeds vehicle capacity"`.
4. All three should fail at creation, not only at `PATCH /api/trips/:id/dispatch`.

### completeMaintenance — RETIRED vehicles stay RETIRED

1. Create an active (`IN_SHOP`) maintenance record for a vehicle.
2. Update that vehicle's status to `RETIRED` while the maintenance record is still open.
3. `PATCH /api/maintenance/:id/complete` on the record.
4. **Expect:** vehicle status remains `RETIRED` (not changed to `AVAILABLE`).

### operationalCost — fuel + maintenance only

For a vehicle with fuel logs, maintenance records, and toll/other expenses logged:

1. `GET /api/vehicles/:id` → `operationalCost` = `fuelCost + maintenanceCost` (toll/other in separate `expensesCost`).
2. `GET /api/reports/analytics` → `summary.operationalCost` matches fleet-wide fuel + maintenance total (excludes toll/other).
3. `GET /api/dashboard` (FLEET_MANAGER) → `operationalCost` matches the same fuel + maintenance total.
4. All three endpoints should agree on operational cost for the same underlying data.