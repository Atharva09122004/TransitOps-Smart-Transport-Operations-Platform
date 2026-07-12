# TransitOps Smart Transport Operations Platform

TransitOps is a transport operations platform built with a Next.js frontend and an Express/Prisma backend.

## Current Stage

The backend authentication module is implemented and ready for Postman testing.

## Tech Stack

- Frontend: Next.js, Tailwind CSS, shadcn/ui
- Backend: Express.js, Prisma ORM, PostgreSQL on Neon
- Authentication: JWT, bcrypt

## Project Structure

```text
backend/
frontend/
```

## Requirements

- Node.js 18+
- npm
- PostgreSQL database URL in the backend `.env`

## Backend Setup

```bash
cd backend
npm install
npm run seed
npm run dev
```

Backend scripts:

- `npm run dev` starts the API in development mode
- `npm run start` starts the API in production mode
- `npm run seed` loads the default users into the database

Backend environment variables:

```env
DATABASE_URL="your_postgres_connection_string"
JWT_SECRET="your_jwt_secret"
PORT=5000
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend scripts:

- `npm run dev` starts the Next.js dev server
- `npm run build` builds the frontend
- `npm run start` starts the production frontend
- `npm run lint` runs ESLint

## Authentication Endpoint

`POST /api/auth/login`

Example request:

```json
{
	"email": "manager@transitops.com",
	"password": "password123"
}
```

Seeded users:

- `manager@transitops.com` / `password123` / `FLEET_MANAGER`
- `driver@transitops.com` / `password123` / `DRIVER`
- `safety@transitops.com` / `password123` / `SAFETY_OFFICER`
- `finance@transitops.com` / `password123` / `FINANCIAL_ANALYST`

## Notes

- Prisma client is configured in [backend/src/config/prisma.js](backend/src/config/prisma.js).
- The frontend currently contains route placeholders for login, dashboard, vehicles, drivers, trips, maintenance, fuel, and reports.