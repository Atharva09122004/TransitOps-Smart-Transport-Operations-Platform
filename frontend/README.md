# Frontend

Next.js frontend for the transport operations platform.

## Structure

```text
frontend/
├── app/
│   ├── login/
│   ├── dashboard/
│   ├── vehicles/
│   ├── drivers/
│   ├── trips/
│   ├── maintenance/
│   ├── fuel/
│   ├── reports/
│   └── layout.tsx
├── components/
│   ├── ui/
│   ├── layout/
│   ├── dashboard/
│   └── shared/
├── services/
├── hooks/
├── lib/
├── types/
└── middleware.ts
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Notes

- UI primitives are installed in [components/ui](components/ui).
- Route placeholders are ready for the main application areas.
