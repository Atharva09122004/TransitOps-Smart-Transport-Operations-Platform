# TransitOps Smart Transport Operations Platform

Monorepo for a transport operations platform with a Node.js/Express backend and a Next.js frontend.

## Structure

```text
backend/
frontend/
```

## Backend

The backend lives in [backend](backend) and uses Express with Prisma.

Key entrypoints:

- [backend/src/server.js](backend/src/server.js)
- [backend/src/app.js](backend/src/app.js)
- [backend/src/config/prisma.js](backend/src/config/prisma.js)

Run it with:

```bash
cd backend
npm install
npm run dev
```

## Frontend

The frontend lives in [frontend](frontend) and uses Next.js App Router.

Key folders:

- [frontend/app](frontend/app)
- [frontend/components](frontend/components)
- [frontend/services](frontend/services)
- [frontend/hooks](frontend/hooks)
- [frontend/lib](frontend/lib)

Run it with:

```bash
cd frontend
npm install
npm run dev
```

## Notes

- Backend Prisma client is configured in [backend/src/config/prisma.js](backend/src/config/prisma.js).
- Frontend route placeholders currently exist for login, dashboard, vehicles, drivers, trips, maintenance, fuel, and reports.