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