# Amoli Fashion Jewellery — Monorepo

## Structure

```
/
├── frontend/   → Next.js 14 (customer-facing UI)
├── admin/      → Next.js 14 (admin dashboard)
├── backend/    → Node.js + Express (all API routes)
└── database/   → Prisma schema + migrations
```

## Setup

### 1. Database
```bash
cd database
cp .env.example .env   # fill DATABASE_URL
npm install
npm run db:push
```

### 2. Backend
```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npm run dev            # port 5000
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev            # port 3000
```

### 4. Admin
```bash
cd admin
cp .env.example .env.local
npm install
npm run dev            # port 3001
```

## Ports
- Frontend: http://localhost:3000
- Admin:    http://localhost:3001
- Backend:  http://localhost:5000
- Database: MySQL on port 3306
